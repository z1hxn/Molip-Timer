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
  const { focusTime, totalTime, isRunning, toggle, reset, formatTime } = useTimer(aiStatus === '몰입 중');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
  }, [model]);

  // 시스템 상태(로딩, 에러)인지 판단
  const isSystemState = ['AI 모델 로딩 중입니다', '카메라를 사용할 수 없습니다', 'AI 모델에 오류가 발생했습니다'].includes(aiStatus);

  return (
    <div className="page-center" style={{ flexDirection: 'column' }}>
      {isSystemState && <div style={{ width: '100%', maxWidth: '1100px', marginBottom: '20px' }}>
        <Alert variant={aiStatus === 'AI 모델 로딩 중입니다' ? 'info' : 'danger'} className="text-center fw-bold shadow-sm">
          {aiStatus}
        </Alert>
      </div>}

      <div className="timer-layout">

        <div className="card timer-card">
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
        <div className="card timer-card">
          <div className="video-wrapper">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="ai-video"
            />
            <canvas ref={canvasRef} className="ai-canvas" />
            {!isSystemState && (
              <div className={`ai-status-badge ${aiStatus === '몰입 중' ? 'status-focused' : 'status-unfocused'}`}>
                {aiStatus}
              </div>
            )}
          </div>
          <div className="ai-countdown">타이머 정지까지</div>
          <div className="ai-countdown">
            <strong>16</strong>
          </div>
          <div className="ai-quote">
            "지금 이 순간이 가장 소중하다"
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timer;
