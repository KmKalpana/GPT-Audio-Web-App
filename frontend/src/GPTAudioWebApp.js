import React, { useState, useRef } from 'react';
import axios from 'axios';
import "./GPTAudioWebApp.css";

const GPTAudioWebApp = () => {
  const [askQuery, setAskQuery] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleInputChange = (e) => {
    setAskQuery(e.target.value);
  };

  const handleBotResponseChange = (e) => {
    setBotResponse(e.target.value);
  };

  const handleButtonClick = () => {
    if (!isListening) {
      startListening();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    axios
      .post('http://localhost:5000/ask', {
        prompt: askQuery,
      })
      .then((response) => {
        setBotResponse(response.data.message);
        const utterance = new SpeechSynthesisUtterance(response.data.message);
        speechSynthesis.speak(utterance);
      })
      .catch((error) => {
        console.log('Error:', error);
      });
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.addEventListener('result', handleRecognitionResult);
    recognition.start();
    setIsListening(true);
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current.stop();
    recognitionRef.current.removeEventListener('result', handleRecognitionResult);
    setIsListening(false);
  };

  const handleRecognitionResult = (e) => {
    const text = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join('');

    setAskQuery(text);
  };

  return (
    <div className="container text-center">
      <h1 className="text-center">GPT Audio Web App</h1>
      <div className="container">
        <div className="mb-3">
          <label htmlFor="askQuery" className="form-label">
            Ask Your Query
          </label>
          <input
            type="text"
            className="form-control"
            id="askQuery"
            value={askQuery}
            onChange={handleInputChange}
            placeholder="Type your query..."
          />
        </div>
        <div className="mb-3">
          <label htmlFor="botResponse" className="form-label">
            Bot Response
          </label>
          <textarea
            className="form-control"
            id="botResponse"
            rows="3"
            value={botResponse}
            onChange={handleBotResponseChange}
          ></textarea>
        </div>
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleButtonClick}
            disabled={isListening}
          >
            {isListening ? 'Listening...' : 'Start Listening'}
          </button>
          <button type="button" className="btn btn-success" onClick={stopListening}>
            Stop Listening
          </button>
        </div>
        <div>
          {!isListening && (
            <form onSubmit={handleFormSubmit}>
              <button type="submit" className="btn btn-primary">
                Submit Query
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GPTAudioWebApp;
