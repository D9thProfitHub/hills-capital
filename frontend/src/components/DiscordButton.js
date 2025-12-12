import React from "react";

function DiscordButton() {
  const handleClick = () => {
    // Replace with your actual Discord invite link
    window.open("https://discord.gg/YourInviteCode", "_blank");
  };

  return (
    <button
      onClick={handleClick}
      style={{
        backgroundColor: "#5865F2",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "5px",
        cursor: "pointer"
      }}
    >
      Join us on Discord
    </button>
  );
}

export default DiscordButton;