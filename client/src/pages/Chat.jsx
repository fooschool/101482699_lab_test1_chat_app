import { useNavigate } from "react-router-dom"

export default function Chat() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("chat_user") || "{}")

  const logout = () => {
    localStorage.removeItem("chat_user")
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex bg-black">
      <div className="m-auto text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">Hello World, {user.firstname}!</h1>
        <button
          onClick={logout}
          className="bg-white text-black py-2 px-4 text-sm cursor-pointer hover:bg-zinc-300"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
