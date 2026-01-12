"use client"

import type React from "react"
import { API_BASE_URL } from "@/lib/api-config"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Trash2, Edit2, Plus, Copy, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Bot {
  bot_id: string
  name: string
  bot_username: string
  bot_token: string
  webhook_url: string
  webhook_set: boolean
  script: string
}

type AuthState = "login" | "signup" | "dashboard"

export default function BotHosterApp() {
  const [authState, setAuthState] = useState<AuthState>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [bots, setBots] = useState<Bot[]>([])
  const [botCount, setBotCount] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBot, setEditingBot] = useState<Bot | null>(null)
  const [newBotName, setNewBotName] = useState("")
  const [newBotToken, setNewBotToken] = useState("")
  const [botScript, setBotScript] = useState('def handle_message(text, message):\n    return "Hello: " + text')
  const [copiedId, setCopiedId] = useState("")
  const [user, setUser] = useState<{ email: string } | null>(null)

  // Simulate Firebase Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate login
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setUser({ email })
      setAuthState("dashboard")
      loadBots()
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate signup
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setUser({ email })
      setAuthState("dashboard")
      loadBots()
    } catch (err) {
      setError("Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadBots = () => {
    // Load bots from localStorage (demo)
    const savedBots = localStorage.getItem("bots")
    if (savedBots) {
      const parsed = JSON.parse(savedBots)
      setBots(parsed)
      setBotCount(parsed.length)
    }
  }

  const createBot = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (!newBotToken) {
        setError("Bot token is required")
        return
      }

      if (botCount >= 10) {
        setError("Maximum 10 bots per account reached")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/bot/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_token: newBotToken,
          name: newBotName || "My Bot",
          script: botScript,
        }),
      }).catch(() => null)

      if (response?.ok) {
        const data = await response.json()
        const newBot: Bot = {
          bot_id: data.bot_id || Math.random().toString(36).substr(2, 9),
          name: newBotName || "My Bot",
          bot_username: data.bot_username || "bot",
          bot_token: newBotToken,
          webhook_url: data.webhook_url || "",
          webhook_set: data.webhook_set || true,
          script: botScript,
        }

        const updatedBots = [...bots, newBot]
        setBots(updatedBots)
        setBotCount(updatedBots.length)
        localStorage.setItem("bots", JSON.stringify(updatedBots))

        setSuccess("Bot created successfully!")
        setNewBotToken("")
        setNewBotName("")
        setBotScript('def handle_message(text, message):\n    return "Hello: " + text')
        setShowCreateModal(false)

        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to create bot. Please check your token.")
      }
    } catch (err) {
      setError("Error creating bot")
    } finally {
      setIsLoading(false)
    }
  }

  const updateBot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBot) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/bot/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_id: editingBot.bot_id,
          script: botScript,
        }),
      }).catch(() => null)

      if (response?.ok) {
        const updatedBots = bots.map((b) => (b.bot_id === editingBot.bot_id ? { ...b, script: botScript } : b))
        setBots(updatedBots)
        localStorage.setItem("bots", JSON.stringify(updatedBots))

        setSuccess("Bot updated successfully!")
        setEditingBot(null)
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to update bot")
      }
    } catch (err) {
      setError("Error updating bot")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteBot = async (botId: string) => {
    if (!confirm("Are you sure you want to delete this bot?")) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/bot/${botId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }).catch(() => null)

      if (response?.ok) {
        const updatedBots = bots.filter((b) => b.bot_id !== botId)
        setBots(updatedBots)
        setBotCount(updatedBots.length)
        localStorage.setItem("bots", JSON.stringify(updatedBots))

        setSuccess("Bot deleted successfully!")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (err) {
      setError("Error deleting bot")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(""), 2000)
  }

  const handleLogout = () => {
    setUser(null)
    setAuthState("login")
    setBots([])
    setEmail("")
    setPassword("")
  }

  // Auth Pages
  if (authState === "login" || authState === "signup") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="https://i.ibb.co/SX1t2PxW/img-8312532076.jpg"
              alt="BotHoster"
              className="w-16 h-16 mx-auto rounded-lg mb-4"
            />
            <h1 className="text-3xl font-bold text-gradient mb-2">BotHoster</h1>
            <p className="text-muted-foreground">Telegram Bot Hosting Platform</p>
          </div>

          <Card className="bg-card border-border-glow">
            <CardHeader>
              <CardTitle className="text-2xl">{authState === "login" ? "Login" : "Create Account"}</CardTitle>
              <CardDescription>
                {authState === "login" ? "Sign in to manage your bots" : "Create a new account to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={authState === "login" ? handleLogin : handleSignup} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:opacity-90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {authState === "login" ? "Signing in..." : "Creating account..."}
                    </>
                  ) : authState === "login" ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                {authState === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        setAuthState("signup")
                        setError("")
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setAuthState("login")
                        setError("")
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center mb-3">Join our official community</p>
                <a
                  href="https://t.me/zerodev24"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition text-sm font-medium"
                >
                  Join Telegram Group
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://i.ibb.co/SX1t2PxW/img-8312532076.jpg"
                alt="BotHoster"
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-gradient">BotHoster</h1>
                <p className="text-xs text-muted-foreground">Telegram Bot Hosting</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{botCount}/10 bots</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <Alert className="mb-6 bg-green-500/10 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Create Bot Button */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Bots</h2>
            <p className="text-muted-foreground">Manage your Telegram bot deployments</p>
          </div>
          <Button
            onClick={() => {
              setShowCreateModal(true)
              setEditingBot(null)
              setNewBotName("")
              setNewBotToken("")
              setBotScript('def handle_message(text, message):\n    return "Hello: " + text')
            }}
            disabled={botCount >= 10}
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Bot
          </Button>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingBot) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl bg-card border-border-glow max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>{editingBot ? "Edit Bot Script" : "Create New Bot"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingBot ? updateBot : createBot} className="space-y-4">
                  {!editingBot && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bot Name</label>
                        <Input
                          placeholder="My Awesome Bot"
                          value={newBotName}
                          onChange={(e) => setNewBotName(e.target.value)}
                          className="bg-input border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bot Token</label>
                        <Input
                          placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                          value={newBotToken}
                          onChange={(e) => setNewBotToken(e.target.value)}
                          className="bg-input border-border"
                          required
                        />
                        <p className="text-xs text-muted-foreground">Get your token from @BotFather on Telegram</p>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Python Script</label>
                    <Textarea
                      value={botScript}
                      onChange={(e) => setBotScript(e.target.value)}
                      className="bg-input border-border font-mono text-sm h-48"
                      placeholder="def handle_message(text, message):&#10;    return 'Response'"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingBot ? "Updating..." : "Creating..."}
                        </>
                      ) : editingBot ? (
                        "Update Bot"
                      ) : (
                        "Create Bot"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false)
                        setEditingBot(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bots Grid */}
        {bots.length === 0 ? (
          <Card className="bg-card border-border text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No bots created yet</p>
              <Button
                onClick={() => {
                  setShowCreateModal(true)
                  setEditingBot(null)
                }}
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Bot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <Card key={bot.bot_id} className="bg-card border-border hover:border-primary/50 transition group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{bot.name}</CardTitle>
                      <CardDescription className="text-xs">@{bot.bot_username}</CardDescription>
                    </div>
                    {bot.webhook_set && (
                      <div className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Active</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Bot ID</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-input p-2 rounded border border-border truncate">
                        {bot.bot_id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(bot.bot_id, `id-${bot.bot_id}`)}
                        className="p-2 hover:bg-input rounded transition"
                      >
                        {copiedId === `id-${bot.bot_id}` ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {bot.webhook_url && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Webhook URL</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-input p-2 rounded border border-border truncate">
                          {bot.webhook_url}
                        </code>
                        <button
                          onClick={() => copyToClipboard(bot.webhook_url, `url-${bot.bot_id}`)}
                          className="p-2 hover:bg-input rounded transition"
                        >
                          {copiedId === `url-${bot.bot_id}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingBot(bot)
                        setBotScript(bot.script)
                        setShowCreateModal(false)
                      }}
                      className="flex-1"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteBot(bot.bot_id)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-gradient mb-2">BotHoster</h3>
              <p className="text-sm text-muted-foreground">The simplest way to host your Telegram bots</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <a
                href="https://t.me/zerodev24"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Join our Telegram Group
              </a>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>© 2026 BotHoster. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
