import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useTimer } from '@features/timer';
import * as tmPose from '@teachablemachine/pose';
import * as tf from '@tensorflow/tfjs';

function Timer() {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || 'Guest';

  type PoseKeypoint = {
    position?: { x?: number; y?: number };
    score?: number;
    x?: number;
    y?: number;
  };
  const getPoint = (kp: PoseKeypoint) => {
    const rawX = (kp as { x?: number; position?: { x?: number } }).x ?? kp.position?.x;
    const rawY = (kp as { y?: number; position?: { y?: number } }).y ?? kp.position?.y;
    const score = typeof kp.score === 'number' ? kp.score : 0;
    return { x: rawX, y: rawY, score };
  };

  const [aiStatus, setAiStatus] = useState('AI 모델 로딩 중입니다');
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [model, setModel] = useState<tmPose.CustomPoseNet | null>(null);
  const { focusTime, totalTime, isRunning, toggle, reset, stop, formatTime } = useTimer(aiStatus === '몰입 중');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countdownRef = useRef<number | null>(null);
  const [pauseSeconds, setPauseSeconds] = useState(30);
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const [showAutoStopAlert, setShowAutoStopAlert] = useState(false);
  const [showAiAlert, setShowAiAlert] = useState(true);
  const [showStartHint] = useState(true);
  const [motivationText, setMotivationText] = useState(
    localStorage.getItem('motivationText') || '지금 이 순간이 가장 소중하다'
  );
  const keypointPairs: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [5, 6],
    [5, 7],
    [7, 9],
    [6, 8],
    [8, 10],
    [5, 11],
    [6, 12],
    [11, 12],
    [11, 13],
    [13, 15],
    [12, 14],
    [14, 16],
  ];

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
          const hasKeypoints = Boolean(pose?.keypoints && pose.keypoints.length > 0);
          if (!hasKeypoints) {
            setAiStatus((prev) => (prev === '미집중' ? prev : '미집중'));
            setAiConfidence(null);
            animationId = requestAnimationFrame(predict);
            return;
          }
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const displayWidth = video.clientWidth || video.videoWidth;
              const displayHeight = video.clientHeight || video.videoHeight;
              if (canvas.width !== displayWidth) {
                canvas.width = displayWidth;
              }
              if (canvas.height !== displayHeight) {
                canvas.height = displayHeight;
              }
              const scaleX = video.videoWidth ? displayWidth / video.videoWidth : 1;
              const scaleY = video.videoHeight ? displayHeight / video.videoHeight : 1;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              const minConfidence = 0.05;
              ctx.strokeStyle = '#22c55e';
              ctx.fillStyle = '#22c55e';
              ctx.lineWidth = 2;
              pose.keypoints.forEach((kp) => {
                const { score } = getPoint(kp);
                let { x, y } = getPoint(kp);
                if (typeof x === 'number' && typeof y === 'number') {
                  if (x <= 1 && y <= 1) {
                    x *= displayWidth;
                    y *= displayHeight;
                  } else {
                    x *= scaleX;
                    y *= scaleY;
                  }
                }
                if (score >= minConfidence && typeof x === 'number' && typeof y === 'number') {
                  ctx.beginPath();
                  ctx.arc(x, y, 4, 0, Math.PI * 2);
                  ctx.fill();
                }
              });
              keypointPairs.forEach(([startIdx, endIdx]) => {
                const start = pose.keypoints[startIdx];
                const end = pose.keypoints[endIdx];
                if (!start || !end) return;
                const startPoint = getPoint(start);
                const endPoint = getPoint(end);
                const startScore = startPoint.score;
                const endScore = endPoint.score;
                let startX = startPoint.x;
                let startY = startPoint.y;
                let endX = endPoint.x;
                let endY = endPoint.y;
                if (typeof startX === 'number' && typeof startY === 'number') {
                  if (startX <= 1 && startY <= 1) {
                    startX *= displayWidth;
                    startY *= displayHeight;
                  } else {
                    startX *= scaleX;
                    startY *= scaleY;
                  }
                }
                if (typeof endX === 'number' && typeof endY === 'number') {
                  if (endX <= 1 && endY <= 1) {
                    endX *= displayWidth;
                    endY *= displayHeight;
                  } else {
                    endX *= scaleX;
                    endY *= scaleY;
                  }
                }
                if (
                  startScore >= minConfidence &&
                  endScore >= minConfidence &&
                  typeof startX === 'number' &&
                  typeof startY === 'number' &&
                  typeof endX === 'number' &&
                  typeof endY === 'number'
                ) {
                  ctx.beginPath();
                  ctx.moveTo(startX, startY);
                  ctx.lineTo(endX, endY);
                  ctx.stroke();
                }
              });
            }
          }

          try {
            if (posenetOutput) {
              const prediction = await model.predictTopK(posenetOutput);
              if (prediction.length > 0) {
                const topClass = prediction.reduce((prev, current) =>
                  prev.probability > current.probability ? prev : current
                );
                const studying = prediction.find((item) => item.className === 'Studying');
                const newStatus = topClass.className === 'Studying' ? "몰입 중" : "미집중";
                setAiStatus(prev => prev === newStatus ? prev : newStatus);
                setAiConfidence(studying ? studying.probability : null);
              }
            }
          } catch (err) {
            console.error("AI 예측 에러:", err);
            setAiStatus("AI 모델에 오류가 발생했습니다");
            setAiConfidence(null);
          }
        } catch (err) {
          console.error("AI 예측 에러:", err);
          setAiStatus("AI 모델에 오류가 발생했습니다");
          setAiConfidence(null);
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
              { isRunning ? '몰입 정지' : totalTime > 0 ? '몰입 재시작' : '몰입 시작' }
            </button>

            {!isRunning && totalTime > 0 && (
              <button className="btn btn-ghost" onClick={reset}>
                종료
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
          <div className="ai-guide">
            얼굴·상체가 프레임 중앙에 들어오고, 책상 높이보다 약간 위 각도에서 촬영하면 정확도가 높아요.
          </div>
          <div className="ai-confidence">
            <small>AI 집중도</small>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>
              {aiConfidence === null ? '--' : `${(aiConfidence * 100).toFixed(1)}%`}
            </div>
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
