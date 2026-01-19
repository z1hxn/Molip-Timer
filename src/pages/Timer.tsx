import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useTimer } from '@features/timer';
import * as tmPose from '@teachablemachine/pose';
import * as tf from '@tensorflow/tfjs';

function Timer() {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || 'Guest';

  const [aiStatus, setAiStatus] = useState('AI 모델 로딩 중입니다');
  const [model, setModel] = useState<tmPose.CustomPoseNet | null>(null);
  const { focusTime, totalTime, isRunning, toggle, reset, stop, formatTime } = useTimer(aiStatus === '몰입 중');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countdownRef = useRef<number | null>(null);
  const [pauseSeconds, setPauseSeconds] = useState(30);
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const [showAutoStopAlert, setShowAutoStopAlert] = useState(false);
  const [showAiAlert, setShowAiAlert] = useState(true);
  const [showStartHint, setShowStartHint] = useState(true);
  const [motivationText, setMotivationText] = useState(
    localStorage.getItem('motivationText') || '지금 이 순간이 가장 소중하다'
  );

  const formatCountdown = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const getPauseSeconds = () => {
    const storedSeconds = Number(localStorage.getItem('pauseSeconds'));
    if (!Number.isNaN(storedSeconds) && storedSeconds > 0) {
      return storedSeconds;
    }
    const raw = Number(localStorage.getItem('pauseMinutes') || 5);
    const mapping: Record<number, number> = {
      3: 15,
      5: 30,
      10: 60,
      15: 120,
    };
    return mapping[raw] ?? raw;
  };

  useEffect(() => {
    const updateSettings = () => {
      const next = getPauseSeconds();
      setPauseSeconds(next);
      setCountdownSeconds(next);
      setMotivationText(localStorage.getItem('motivationText') || '지금 이 순간이 가장 소중하다');
    };
    updateSettings();
    window.addEventListener('focus', updateSettings);
    window.addEventListener('storage', updateSettings);
    return () => {
      window.removeEventListener('focus', updateSettings);
      window.removeEventListener('storage', updateSettings);
    };
  }, []);

  useEffect(() => {
    setCountdownSeconds(pauseSeconds);
  }, [pauseSeconds]);

  useEffect(() => {
    if (!isRunning || aiStatus !== '미집중') {
      if (countdownRef.current !== null) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setCountdownSeconds(pauseSeconds);
      return;
    }

    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current);
    }

    countdownRef.current = window.setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          if (countdownRef.current !== null) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          setShowAutoStopAlert(true);
          stop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current !== null) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [aiStatus, isRunning, pauseSeconds, stop]);

  useEffect(() => {
    const loadModel = async () => {
      try {
        try {
          await tf.setBackend('webgl');
        } catch {
          await tf.setBackend('cpu');
        }
        await tf.ready();
        const modelURL = "/molip-ai/v1/model.json";
        const metadataURL = "/molip-ai/v1/metadata.json";
        const loadedModel = await tmPose.load(modelURL, metadataURL);
        console.log("AI 모델 메타데이터:", loadedModel.getMetadata()); // 메타데이터 로드 확인용
        setModel(loadedModel);
      } catch (err) {
        console.error("AI 모델 로드 실패:", err);
        setAiStatus("AI 모델에 오류가 발생했습니다");
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    setShowAiAlert(true);
  }, [aiStatus]);

  useEffect(() => {
    // 웹캠 연결 시작
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setAiStatus('미집중'); // 초기 상태
        }
      } catch (err) {
        console.error("웹캠을 찾을 수 없습니다:", err);
        setAiStatus('카메라를 사용할 수 없습니다');
      }
    };
    startWebcam();
  }, []);

  useEffect(() => {
    if (!model || !videoRef.current) return;

    const video = videoRef.current;
    let animationId: number;

    const predict = async () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        try {
          if (!isRunning) {
            if (canvasRef.current) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
            }
            animationId = requestAnimationFrame(predict);
            return;
          }
          const { pose, posenetOutput } = await model.estimatePose(video);
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              if (canvas.width !== video.videoWidth) {
                canvas.width = video.videoWidth;
              }
              if (canvas.height !== video.videoHeight) {
                canvas.height = video.videoHeight;
              }
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              tmPose.drawKeypoints(pose.keypoints, 0.2, ctx);
              tmPose.drawSkeleton(pose.keypoints, 0.2, ctx);
            }
          }

          try {
            const prediction = await model.predictTopK(posenetOutput);
            if (prediction.length > 0) {
              const topClass = prediction.reduce((prev, current) =>
                prev.probability > current.probability ? prev : current
              );
              const newStatus = topClass.className === 'Studying' ? "몰입 중" : "미집중";
              setAiStatus(prev => prev === newStatus ? prev : newStatus);
            }
          } catch (err) {
            console.error("AI 예측 에러:", err);
            setAiStatus("AI 모델에 오류가 발생했습니다");
          }
        } catch (err) {
          console.error("AI 예측 에러:", err);
          setAiStatus("AI 모델에 오류가 발생했습니다");
        }
      }
      animationId = requestAnimationFrame(predict);
    };

    predict();
    return () => cancelAnimationFrame(animationId);
  }, [isRunning, model]);

  // 시스템 상태(로딩, 에러)인지 판단
  const isSystemState = ['AI 모델 로딩 중입니다', '카메라를 사용할 수 없습니다', 'AI 모델에 오류가 발생했습니다'].includes(aiStatus);

  return (
    <div className="page-center" style={{ flexDirection: 'column' }}>
      {(isSystemState || showAutoStopAlert) && (
        <div style={{ width: '100%', maxWidth: '1100px', marginBottom: '20px' }}>
          {showAutoStopAlert && (
            <Alert
              variant="warning"
              dismissible
              onClose={() => setShowAutoStopAlert(false)}
              className="text-center fw-bold shadow-sm"
            >
              미집중 상태가 계속되어 타이머가 정지되었습니다.
            </Alert>
          )}
          {isSystemState && showAiAlert && (
            <Alert
              variant={aiStatus === 'AI 모델 로딩 중입니다' ? 'info' : 'danger'}
              dismissible
              onClose={() => setShowAiAlert(false)}
              className="text-center fw-bold shadow-sm"
            >
              {aiStatus}
            </Alert>
          )}
        </div>
      )}

      <div className="timer-layout">

        <div className="card timer-card fixed-panel">
          <div className="timer-nickname">
            {nickname}
          </div>
          
          <div style={{ marginBottom: '1rem', color: '#6c757d' }}>
            <small>총 경과 시간</small>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{formatTime(totalTime)}</div>
          </div>

          <div style={{ color: '#6c757d' }}><small>몰입 시간</small></div>
          <div className="timer-time">{formatTime(focusTime)}</div>

          <div className="timer-buttons">
            <button
              className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`}
              onClick={toggle}>
              { isRunning? '정지' : totalTime > 0 ? '몰입 재시작' : '몰입 시작' }
            </button>

            {!isRunning && totalTime > 0 && (
              <button className="btn btn-ghost" onClick={reset}>
                리셋
              </button>
            )}
          </div>

          <button
            className="timer-settings-text"
            onClick={() => navigate('/settings')}>
            설정
          </button>
        </div>
        <div className="card timer-card fixed-media">
          <div className="video-wrapper">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`ai-video ${isRunning ? '' : 'is-idle'}`}
            />
            <canvas ref={canvasRef} className={`ai-canvas ${isRunning ? '' : 'is-hidden'}`} />
            {!isRunning && !isSystemState && showStartHint && (
              <div className="ai-start-overlay">
                <div className="ai-overlay-title">타이머를 시작해 주세요</div>
                <div className="ai-overlay-sub">
                  시작하면 몰입 상태를 판독하고 스켈레톤을 표시합니다.
                </div>
              </div>
            )}
            {isRunning && !isSystemState && (
              <div className={`ai-status-badge ${aiStatus === '몰입 중' ? 'status-focused' : 'status-unfocused'}`}>
                {aiStatus}
              </div>
            )}
          </div>
          <div className={`countdown-slot ${isRunning && aiStatus === '미집중' ? 'is-active' : 'is-hidden'}`}>
            <div className="ai-countdown-card">
              <div className="ai-countdown-label">타이머 정지까지</div>
              <div className="ai-countdown-value">{formatCountdown(countdownSeconds)}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="motivation-footer">
        <div className="motivation-label">오늘의 문구</div>
        <div className="motivation-text">"{motivationText}"</div>
      </div>
    </div>
  );
}

export default Timer;
