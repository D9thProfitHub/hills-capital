const generateAffiliateCode = (user) => {
  // Use first 3 letters of name + last 3 digits of user ID
  const namePart = user.name ? 
    user.name.substring(0, 3).toUpperCase() : 
    'USR';
  
  // Add random 3-digit number if ID not available yet
  const idPart = user.id ? 
    String(user.id).slice(-3).padStart(3, '0') :
    String(Math.floor(Math.random() * 900) + 100);
    
  return `${namePart}${idPart}`;
};

export { generateAffiliateCode };
