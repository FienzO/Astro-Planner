import axios from 'axios';
import '../App.css';
import { useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [apiResponse, setApiResponse] = useState({ message: '', type: '' });

  const handleLogIn = async (e) => {
    e.preventDefault();
    //console.log('Submitting:', {username, password});
    try {
    const response = await axios.post("http://127.0.0.1:5000/login", {
      username: username,
      password: password,
    });

    setApiResponse({
      message: response.data.message, 
      type: 'success' 
    });
    setUsername('')
    setPassword('')

    } catch (error) {
      if (error.response.data['message']) {
        setApiResponse({
          message: error.response.data.message, 
          type: 'error' 
        });
      } else {
        console.error('Login error:', error.response.data);
        if (error.request) {
          console.error('No response from server:', error.request);
        } else {
          console.error('Error', error.message);
        }
      }
    }
  };


  return (
    <div className="App">
      <div className="App-title">
        <form onSubmit={handleLogIn}>        
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              placeholder="jane_doe"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="password-input-container">
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                placeholder="password1234"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="toggle-password-button" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                {isPasswordVisible ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <button type="submit">Log in</button>
          </div>
          {apiResponse.message && (
              <p className={apiResponse.type === 'error' ? 'error-message' : 'success-message'}>{apiResponse.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
