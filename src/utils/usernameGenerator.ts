export function generateUsername(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let username = "";

  for (let i = 0; i < 3; i++) {
    username += letters[Math.floor(Math.random() * letters.length)];
  }

  for (let i = 0; i < 3; i++) {
    username += numbers[Math.floor(Math.random() * numbers.length)];
  }

  return username;
}