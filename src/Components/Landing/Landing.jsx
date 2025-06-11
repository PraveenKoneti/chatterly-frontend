import React, { useState, useEffect, useRef, useCallback } from 'react';

import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import logo from "../../Images/chatterlyIcon.png";
import "./Landing.scss";
import { toast } from 'react-toastify';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const chatBodyRef = useRef(null);
const navigate = useNavigate();

  const fetchMessages = useCallback(async () => {
    try {
      const response = await axios.get(`https://chatterly-backend-14vz.onrender.com/chats/user/${sessionStorage.getItem("userId")}`);
      const chatPairs = response.data.flatMap(msg => ([
        { message: msg.message, user: true },
        { message: msg.response, user: false }
      ]));
      setMessages(chatPairs);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }

  };

  const sendMessage = async () => {
    const trimmedInput = userInput.trim();
  
  if (!sessionStorage.getItem("userId")) {
    toast.error("Please login");
    navigate("/login");
    return;
  }
    if (!trimmedInput) return;

    const newUserMessage = { message: trimmedInput, user: true };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    scrollToBottom();

    const botLoadingMsg = { message: '.', user: false };
    setMessages(prev => [...prev, botLoadingMsg]);

    let dotCount = 1;
    const loadingInterval = setInterval(() => {
      setMessages(prev => {
        const updated = [...prev];
        const dots = '.'.repeat(dotCount);
        updated[updated.length - 1].message = dots;
        return updated;
      });

      dotCount = dotCount < 3 ? dotCount + 1 : 1;
      scrollToBottom();
    }, 500);

    try {
      const response = await axios.post("https://chatterly-backend-14vz.onrender.com/chats/message", {
        message: trimmedInput,
        user_id: sessionStorage.getItem("userId"),
      });

      clearInterval(loadingInterval);

      if (response.data?.success !== false && response.data?.chat?.response) {
        const botResponse = response.data.chat.response;
        let botMessage = "";
        let index = 0;

        const typingInterval = setInterval(() => {
          if (index < botResponse.length) {
            botMessage += botResponse[index];
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1].message = botMessage;
              return updated;
            });
            scrollToBottom();
            index++;
          } else {
            clearInterval(typingInterval);
          }
        }, 10);
      } else {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].message = "Sorry, I couldn't understand that.";
          return updated;
        });
      }
    } catch (error) {
      clearInterval(loadingInterval);
      console.error("Error sending message:", error);
      toast.error("Something went wrong while sending the message.");
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].message = "Error occurred. Try again.";
        return updated;
      });
    }
  };

  return (
    <div className="row vh-100 p-0 m-0">
      {/* Sidebar */}
      <div className="col-md-3 d-none d-md-flex flex-column sidebar vh-100">
        <div className="p-0">
          <img src={logo} width="60" height="60" alt="Chatterly Logo" />
          <b className="text-white fs-3"> Chatterly </b>
        </div>
        <hr className="text-white" size="16" />
        <h5 className="text-light text-center">Today's Searches</h5>
        <ul className="list-group overflow-auto border-0">
          {messages.slice().reverse().filter(msg => msg.user).map((search, index) => (
            <li key={index} className="list-group-item text-white text-start border-0 border-bottom">
              <i className="bi bi-search text-warning me-1"></i> {search.message}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Box */}
      <div className="col-12 col-md-9 m-auto">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light rounded-top shadow-sm mb-2">
          <div className="container-fluid">
            <button className="navbar-brand text-dark p-0 m-0 btn btn-link">
              <img src={logo} width="50" height="50" alt="Chatterly Logo" className="m-0 p-0" />
              <b className="fs-5 ms-0"> Chatterly </b>
            </button>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                {sessionStorage.getItem("userId") ? (
                  <>
                    <li className="nav-item me-3 text-dark fw-bold fs-5 align-items-center d-flex">
                      Welcome, <b className='text-primary ms-1'>{sessionStorage.getItem("userName")}</b>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/"
                        className="btn btn-danger btn-sm text-white"
                        onClick={() => {
                          sessionStorage.clear();
                          window.location.reload();
                        }}
                      >
                        Sign out
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item me-2 mt-2">
                      <Link to="/login" className="btn btn-warning btn-sm text-white form-control">
                        Login
                      </Link>
                    </li>
                    <li className="nav-item mt-2">
                      <Link to="/signup" className="btn btn-primary btn-sm text-white form-control">
                        SignUp
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>

        {/* Chat Container */}
        <div className="col-sm-11 col-md-11 col-lg-11 col-xl-11 m-auto card shadow-lg chat-container rounded border-0">
          {messages.length === 0 && (
            <div className="start-chat-popup d-flex align-items-center justify-content-center">
              <h5>Start a conversation!</h5>
            </div>
          )}
          <div className="card-body chat-body" ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble ${msg.user ? 'user-message' : 'bot-message'}`}>
                <div className="text-start">
                  <i className={`bi ${msg.user ? 'bi-person-circle user-icon' : 'bi-robot bot-icon'}`}></i>
                  <span className="ms-2 text-start">{msg.message}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Section */}
          <div className="card-footer border-top-0 p-3 bg-light">
            <div className="row g-2 align-items-center">
              <div className="col-10">
                <input
                  type="text"
                  className="form-control form-control-lg rounded-pill"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask anything..."
                />
              </div>
              <div className="col-2 text-center">
                <button className="btn btn-primary btn-lg rounded-pill px-3" onClick={sendMessage}>
                  <i className="bi bi-send fs-5"></i>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatPage;
