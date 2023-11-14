import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./css/MemberCard.css";
import { AuthContext } from "../../firebase/context/AuthContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";


const MemberCard = ({ users }) => {
  const { currentUser } = useContext(AuthContext);
  const [favourites, setFavourites] = useState([]);

  const { id } = useParams();
  const selectedUser = users.find((user) => user.id === parseInt(id, 10));

  useEffect(() => {
    if (currentUser && currentUser.favourites) {
      setFavourites(currentUser.favourites);
    }
  }, [currentUser]);

  if (!selectedUser) {
    return <div>User not found</div>;
  }

  // const toTitleCase = (str) => {
  //   return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  // };

  const isUserInFavourites = () => {
    return favourites.some((fav) => fav.id === selectedUser.id);
  };

  const handleButtonClick = () => {
    if (isUserInFavourites()) {
      removeFromFavourites();
    } else {
      addToFavourites();
    }
  };

  const addToFavourites = () => {
    if (currentUser && currentUser.id) {
      const userId = currentUser.id;
      const updatedFavourites = [...favourites, selectedUser];
  
      fetch(`/api/users/${userId}/favourites/${selectedUser.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          favourites: updatedFavourites.map((user) => user.id),
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to update user data");
          }
          return response.json();
        })
        .then((data) => {
          console.log("User data updated successfully:", data);
          setFavourites(updatedFavourites);
        })
        .catch((error) => {
          console.error("Error updating user data:", error);
        });
    }
  };

  const removeFromFavourites = () => {
    if (currentUser && currentUser.id) {
      const userId = currentUser.id;
      const updatedFavourites = favourites.filter(
        (fav) => fav.id !== selectedUser.id
      );
  
      fetch(`/api/users/${userId}/favourites/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          favourites: updatedFavourites.map((user) => user.id),
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to update user data");
          }
          return response.json();
        })
        .then((data) => {
          console.log("User data updated successfully:", data);
          setFavourites(updatedFavourites);
        })
        .catch((error) => {
          console.error("Error updating user data:", error);
        });
    }
  };

  return (
    <div className="member-card-container">
      <div className="member-card-wrapper">
        <div className="member-card-details">
        <button onClick={handleButtonClick}>
            {isUserInFavourites() ? <FaHeart /> : <FaRegHeart />}
          </button>
          <img src={selectedUser.photoURL} alt="user" className="image" />
          <p className="name">
            {selectedUser.firstName} {selectedUser.lastName}
          </p>
          <div className="card-details">
            Age: {selectedUser.age}
            <br />
            Gender: {selectedUser.gender}
            <br />
            Area: {selectedUser.area}
            <br />
            Distance walked: {selectedUser.distance} miles
            <br />
            <button className="invite">
              <Link to="/walkiesForm">Send Invitation</Link>
            </button>
          </div>
        </div>
        <div className="dog-details">
          {selectedUser.dogs.map((dog) => (
            <div key={dog.id} className="dog-container">
              <li className="dogs" key={dog.id}>
                <Link to={`/dogs/${dog.id}`} className="dog-link">
                  <b>{dog.name}</b>
                  <br />
                  {dog.breed}
                  <br />
                  Need Leash:{" "}
                  {dog.leash ? <span>&#10003;</span> : <span>&#10008;</span>}
                  <br />
                  Neutered:{" "}
                  {dog.neutered ? <span>&#10003;</span> : <span>&#10008;</span>}
                  <br />
                  Vaccinated:{" "}
                  {dog.vaccinated ? (
                    <span>&#10003;</span>
                  ) : (
                    <span>&#10008;</span>
                  )}
                  <br />
                </Link>
              </li>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
