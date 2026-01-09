import './App.css';
import { Routes, Route } from 'react-router-dom';
import * as tf from '@tensorflow/tfjs';
import Home from './pages/Home.tsx';
import Timer from './pages/Timer.tsx';
import Header from './components/Header.tsx';

function App() {

  return (
    <div className='App'>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timer" element={<Timer />} />
      </Routes>

    </div>
  )
}

export default App
