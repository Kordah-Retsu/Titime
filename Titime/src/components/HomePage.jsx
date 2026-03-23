function HomePage({ onSignOut }) {
    return (
    <div className="HomePage">
        <div className="SignoutButton">
            <button onClick={onSignOut}>Sign Out</button>
        </div>
        <div className="Header">
            <h1>Home Page</h1>
            <p>By Retsu</p>
            <p>Welcome to Titime!</p>
        </div>
        <div className="ContentBox">
            <div className="SubscribedClubs">
                <div className="SubscribedClubsHeader">
                    <h1>Your Clubs</h1>
                    <p>View dues, manage payments and more.</p>
                </div>
                <div className="SubscribedClubsList">
                    <div className="ClubCard">
                        <h2>Youth Alive Club</h2>
                        <p>Active 'n' Vibrant</p>
                        <button>View Dues</button>
                    </div>
                    <div className="ClubCard">
                        <h2>HIECH Club</h2>
                        <p>Happiness In Every Childs Heart!</p>
                        <button>View Dues</button>
                    </div>
                    </div>
                </div>

            <div className="AllClubs">
                <div className="AllClubsHeader">
                    <h1>All Clubs</h1>
                    <p>Explore and subscribe to new clubs.</p>
                </div>
                <div className="AllClubsList">
                    <div className="ClubCard">
                        <h2>Chess Club</h2>
                        <p>Join the Chess Club and improve your skills!</p>
                        <button>Subscribe</button>
                    </div>
                    <div className="ClubCard">
                        <h2>Robotics Club</h2>
                        <p>Join the Robotics Club and build amazing robots!</p>
                        <button>Subscribe</button>
                    </div>
                    <div className="ClubCard">
                        <h2>Art Club</h2>
                        <p>Join the Art Club and unleash your creativity!</p>
                        <button>Subscribe</button>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
    )
}
export default HomePage