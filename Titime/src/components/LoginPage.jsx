function LoginPage() {
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
          <button>Login</button>
        </div>
        <div className="RegisterLink">
          <p>Don't have an account? <a href="#">Register here</a></p>
        </div>
      </div>
    </div>
  )
}
export default LoginPage