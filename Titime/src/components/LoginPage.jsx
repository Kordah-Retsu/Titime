function LoginPage({ onLogin }) {
  return (
    <div className="LoginPage">
      <div className='LoginPageContainer'>
        <div className="WelcomeText">
          <h1>Titime</h1>
          <p>By Retsu</p>
          <p>Welcome to Titime!</p>
          <p>Automated club-fees payment system</p>
        </div>
        <div className="LoginForm">
            <p>Login to your account</p>
          <input type="text" placeholder='Username' />
          <input type="password" placeholder='Password' />
          <button className="MainLoginButton" onClick={onLogin}>Login</button>
          <div className="Divider">or</div>
          <button className="GoogleLogin">Login with Google</button>
          <button className="PhoneLogin">Login with Phone Number</button>
        </div>
      </div>
    </div>
  )
}
export default LoginPage