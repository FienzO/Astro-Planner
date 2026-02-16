import axios from 'axios';
import '../App.css';
import { useState} from 'react';
import { useNavigate } from 'react-router-dom'

function Reset1() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [firmPassword, setFirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [apiResponse, setApiResponse] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();

     if (!password || !firmPassword) {
      alert("Please enter password and Confirm password!");
      return;
    } else if (!code) {
      alert("Please enter 2FA code!");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/reset1", {
        firmPassword: firmPassword,
        password: password,
        email: email,
        code: code,
      });


      setApiResponse({
        message: response.data.message, 
        type: 'success' 
      });

      navigate('/login')


    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setApiResponse({
          message: error.response.data.message, 
          type: 'error' 
        });
      } else if (error.request) {
        setApiResponse({
          message: "No response from server.",
          type: 'error'
        });
      } else {
        setApiResponse({
          message: `Error: ${error.message}`,
          type: 'error'
        });
      }

      console.error(error);
    }
  };


  return (
    <div className="App">
      <div className="App-title">
        <form onSubmit={handleReset}>
          <div className="input-group">
            <label title="Your recovery Email">Email</label>
            <input
              type="text"
              value={email}
              placeholder="jane.doe@domain.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>         
          <div className="input-group">
            <label>Recovery Code</label>
            <input
              type="int"
              value={code}
              placeholder="12345"
              onChange={(e) => setCode(e.target.value)}
            />
          </div>  
          <div className="input-group">
            <label title="Your Password">Password</label>
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
          <div className="input-group">
            <label>Confirm Password</label>
            <div className="password-input-container">
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={firmPassword}
                placeholder="password1234"
                onChange={(e) => setFirmPassword(e.target.value)}
              />
              <button type="button" className="toggle-password-button" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                {isPasswordVisible ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <button type="submit">Recover</button>
          </div>
        </form>

        {apiResponse.message && (
        <p className={apiResponse.type === 'error' ? 'error-message' : 'success-message'}>{apiResponse.message}</p>
        )}
      </div>
    </div>
  );
}

export default Reset1;
