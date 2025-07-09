import { useEffect, useState, useRef } from 'react';
import './App.css';

const sentences = [
  `The quick brown fox\njumps over the lazy dog.`,
  `Life is what happens\nwhen you're busy making other plans.`,
  `In the midst of winter,\nI found an invincible summer.`,
  `You have within you right now\neverything you need to handle life.`,
  `He sent her love letters for 50 years—\nnever once mailed. After his funeral,\nshe found them. She wrote him back.`,
];

const correctSound = new Audio(new URL('./correct.mp3', import.meta.url));
const wrongSound = new Audio(new URL('./wrong.mp3', import.meta.url));
const completeSound = new Audio(new URL('./complete.mp3', import.meta.url));


function App() {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [result, setResult] = useState(null);
  const [resultHistory, setResultHistory] = useState([]);
  const [timer, setTimer] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    resetTest();
  }, []);

  useEffect(() => {
    let interval;
    if (startTime && !endTime && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    if (timer === 0 && !result) {
      calculateResult(startTime, new Date(), true);
    }
    return () => clearInterval(interval);
  }, [startTime, timer, endTime, result]);

  const resetTest = () => {
    const random = sentences[Math.floor(Math.random() * sentences.length)];
    setText(random);
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setResult(null);
    setTimer(60);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    if (!startTime && val.length > 0) {
      setStartTime(new Date());
    }

    const char = val[val.length - 1];
    const correctChar = text[val.length - 1];

    if (soundEnabled && char !== undefined) {
      if (char === correctChar) correctSound.play();
      else wrongSound.play();
    }

    if (val === text) {
      const end = new Date();
      setEndTime(end);
      if (soundEnabled) completeSound.play();
      calculateResult(startTime, end);
    }
  };

  const calculateResult = (start, end, isTimeout = false) => {
    const timeTaken = (end - start) / 1000;
    const words = text.trim().split(/\s+/).length;
    const speed = Math.round((words / timeTaken) * 60);
    const correctChars = input.split("").filter((c, i) => c === text[i]).length;
    const accuracy = Math.round((correctChars / text.length) * 100);

    const res = {
      speed: isTimeout ? 0 : speed,
      accuracy,
      time: isTimeout ? 60 : timeTaken.toFixed(2),
    };

    setResult(res);
    setResultHistory((prev) => [res, ...prev]);
  };

  const getHighlightedText = () => {
    return text.split("").map((char, idx) => {
      let typedChar = input[idx];
      let className = "";
      if (typedChar === undefined) className = "";
      else if (typedChar === char) className = "correct";
      else className = "incorrect";
      return (
        <span key={idx} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="container">
      <h1>⌨️ Typing Speed Test</h1>
      <p className="timer">⏰ Time Left: {timer}s</p>
      <button onClick={() => setSoundEnabled(!soundEnabled)} className="sound-toggle">
        {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
      </button>

      <div className="box">
        <pre className="quote">{getHighlightedText()}</pre>
        <textarea
          ref={inputRef}
          className="input"
          placeholder="Start typing here..."
          value={input}
          onChange={handleInputChange}
          disabled={result || timer === 0}
        />
        {result ? (
          <div className="result">
            <p>🚀 Speed: <strong>{result.speed}</strong> WPM</p>
            <p>🎯 Accuracy: <strong>{result.accuracy}%</strong></p>
            <p>⏱️ Time Taken: <strong>{result.time}</strong> sec</p>
            <button onClick={resetTest}>🔁 Try Again</button>
          </div>
        ) : (
          <p className="instruction">💬 Type the sentence above to test your speed.</p>
        )}
      </div>

      {resultHistory.length > 0 && (
        <div className="history">
          <h3>📈 Your Past Results</h3>
          <ul>
            {resultHistory.map((r, i) => (
              <li key={i}>
                🚀 <strong>{r.speed} WPM</strong> &nbsp; 🎯 <strong>{r.accuracy}%</strong> &nbsp; ⏱️ <strong>{r.time}s</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="about">
        <h3>👨‍💻 About This Project</h3>
        <p>This website developed by Ashutosh pradhan.</p>
        <p>
          🔗 GitHub: <a href="https://github.com/ashutosh-username" target="_blank" rel="noopener noreferrer">github.com/ashutosh-username</a><br />
          💻 Source Code: <a href="https://github.com/ashutosh-username/typing-speed-test" target="_blank" rel="noopener noreferrer">View Code on GitHub</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
