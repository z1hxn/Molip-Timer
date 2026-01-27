import { useEffect, useRef, useState } from 'react';
import * as tmPose from '@teachablemachine/pose';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

type PoseKeypoint = {
  position?: { x?: number; y?: number };
  score?: number;
  x?: number;
  y?: number;
};

const MODEL_URL = `${import.meta.env.BASE_URL}molip-ai/v1/model.json`;
const METADATA_URL = `${import.meta.env.BASE_URL}molip-ai/v1/metadata.json`;
const SYSTEM_STATUSES = [
  'AI 모델 로딩 중입니다',
  '카메라를 사용할 수 없습니다',
  'AI 모델에 오류가 발생했습니다',
] as const;

const KEYPOINT_PAIRS: Array<[number, number]> = [
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

const getPoint = (kp: PoseKeypoint) => {
  const rawX = (kp as { x?: number; position?: { x?: number } }).x ?? kp.position?.x;
  const rawY = (kp as { y?: number; position?: { y?: number } }).y ?? kp.position?.y;
  const score = typeof kp.score === 'number' ? kp.score : 0;
  return { x: rawX, y: rawY, score };
};

export function useAiPose(isRunning: boolean) {
  const [aiStatus, setAiStatus] = useState('AI 모델 로딩 중입니다');
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [model, setModel] = useState<tmPose.CustomPoseNet | null>(null);
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
        const loadedModel = await tmPose.load(MODEL_URL, METADATA_URL);
        console.log('AI 모델 메타데이터:', loadedModel.getMetadata());
        setModel(loadedModel);
      } catch (err) {
        console.error('AI 모델 로드 실패:', err);
        setAiStatus('AI 모델에 오류가 발생했습니다');
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setAiStatus('미집중');
        }
      } catch (err) {
        console.error('웹캠을 찾을 수 없습니다:', err);
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
              KEYPOINT_PAIRS.forEach(([startIdx, endIdx]) => {
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
                const newStatus = topClass.className === 'Studying' ? '몰입 중' : '미집중';
                setAiStatus((prev) => (prev === newStatus ? prev : newStatus));
                setAiConfidence(studying ? studying.probability : null);
              }
            }
          } catch (err) {
            console.error('AI 예측 에러:', err);
            setAiStatus('AI 모델에 오류가 발생했습니다');
            setAiConfidence(null);
          }
        } catch (err) {
          console.error('AI 예측 에러:', err);
          setAiStatus('AI 모델에 오류가 발생했습니다');
          setAiConfidence(null);
        }
      }
      animationId = requestAnimationFrame(predict);
    };

    predict();
    return () => cancelAnimationFrame(animationId);
  }, [isRunning, model]);

  return {
    aiStatus,
    aiConfidence,
    videoRef,
    canvasRef,
    isSystemState: SYSTEM_STATUSES.includes(aiStatus as (typeof SYSTEM_STATUSES)[number]),
  };
}
