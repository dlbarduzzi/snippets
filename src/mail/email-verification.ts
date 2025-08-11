async function sendEmailVerification(email: string, token: string) {
  console.warn("PROD email notification", { email, token: `${token.slice(0, 4)}...` })
}

export { sendEmailVerification }
