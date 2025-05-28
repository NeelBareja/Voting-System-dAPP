"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Vote, Plus, Users, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Contract ABI (only the functions we need)
const CONTRACT_ABI = [
  "function addCandidate(bytes32 _candidateId) public",
  "function castVoteFor(bytes32 _candidateId) public",
  "function voteCountOf(bytes32 _candidateId) public view returns (uint256)",
  "function getCandidates() public view returns (bytes32[] memory)",
  "function totalCandidates() public view returns (uint256)",
  "function owner() public view returns (address)",
  "event CandidateAdded(bytes32 candidateId)",
  "event VoteCast(address indexed voter, bytes32 candidateId)",
]

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x286AB48E87E21aD6d577A067A37DE1138E07f885" // You'll need to add your contract address here

interface Candidate {
  id: string
  bytes32Id: string
  votes: number
}

export default function VotingDApp() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [account, setAccount] = useState<string>("")
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [newCandidate, setNewCandidate] = useState<string>("")
  const [selectedCandidate, setSelectedCandidate] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [hasVoted, setHasVoted] = useState<boolean>(false)
  const { toast } = useToast()

  // Convert string to bytes32 (lowercase)
  const stringToBytes32 = (str: string): string => {
    return ethers.encodeBytes32String(str.toLowerCase())
  }

  // Convert bytes32 to string
  const bytes32ToString = (bytes32: string): string => {
    return ethers.decodeBytes32String(bytes32)
  }

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

        setProvider(provider)
        setSigner(signer)
        setContract(contract)
        setAccount(accounts[0])

        // Check if current account is owner
        const owner = await contract.owner()
        setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase())

        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        })

        // Load candidates
        await loadCandidates(contract)
      } else {
        toast({
          title: "MetaMask not found",
          description: "Please install MetaMask to use this application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null)
    setSigner(null)
    setContract(null)
    setAccount("")
    setIsOwner(false)
    setCandidates([])
    setNewCandidate("")
    setSelectedCandidate("")
    setHasVoted(false)

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  // Load candidates from contract
  const loadCandidates = async (contractInstance?: ethers.Contract) => {
    try {
      const contractToUse = contractInstance || contract
      if (!contractToUse) return

      const candidateBytes32 = await contractToUse.getCandidates()
      const candidatesWithVotes: Candidate[] = []

      for (const candidateBytes32Id of candidateBytes32) {
        const candidateName = bytes32ToString(candidateBytes32Id)
        const votes = await contractToUse.voteCountOf(candidateBytes32Id)
        candidatesWithVotes.push({
          id: candidateName,
          bytes32Id: candidateBytes32Id,
          votes: Number(votes),
        })
      }

      setCandidates(candidatesWithVotes)
    } catch (error) {
      console.error("Error loading candidates:", error)
    }
  }

  // Add new candidate (owner only)
  const addCandidate = async () => {
    if (!contract || !newCandidate.trim()) return

    try {
      setLoading(true)
      const candidateBytes32 = stringToBytes32(newCandidate.trim())

      const tx = await contract.addCandidate(candidateBytes32)
      await tx.wait()

      toast({
        title: "Candidate Added",
        description: `${newCandidate.toLowerCase()} has been added as a candidate`,
      })

      setNewCandidate("")
      await loadCandidates()
    } catch (error: any) {
      console.error("Error adding candidate:", error)
      toast({
        title: "Error",
        description: error.reason || "Failed to add candidate",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Cast vote
  const castVote = async (candidateId: string) => {
    if (!contract) return

    try {
      setLoading(true)
      const candidateBytes32 = stringToBytes32(candidateId)

      const tx = await contract.castVoteFor(candidateBytes32)
      await tx.wait()

      toast({
        title: "Vote Cast",
        description: `Your vote for ${candidateId} has been recorded`,
      })

      setHasVoted(true)
      await loadCandidates()
    } catch (error: any) {
      console.error("Error casting vote:", error)
      toast({
        title: "Error",
        description: error.reason || "Failed to cast vote",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Check if user has voted (simplified - in real app you'd check the contract)
  useEffect(() => {
    // This is a simplified check. In a real application, you'd want to
    // check the contract's mapping or events to see if the user has voted
  }, [account])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Decentralized Voting System</h1>
          <p className="text-gray-600">Cast your vote securely on the blockchain</p>
        </div>

        {/* Wallet Connection */}
        {!account ? (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </CardTitle>
              <CardDescription>Connect your MetaMask wallet to participate in voting</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={connectWallet} className="w-full">
                Connect MetaMask
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Account Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Connected:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </code>
                    {isOwner && <Badge variant="secondary">Owner</Badge>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm text-gray-600">{candidates.length} candidates</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={disconnectWallet}>
                      Disconnect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Candidate (Owner Only) */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Candidate
                  </CardTitle>
                  <CardDescription>
                    Add a new candidate to the voting system (will be converted to lowercase)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidate">Candidate Name</Label>
                    <Input
                      id="candidate"
                      placeholder="Enter candidate name"
                      value={newCandidate}
                      onChange={(e) => setNewCandidate(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCandidate()}
                    />
                    {newCandidate && (
                      <p className="text-sm text-gray-500">
                        Will be stored as:{" "}
                        <code className="bg-gray-100 px-1 rounded">{newCandidate.toLowerCase()}</code>
                      </p>
                    )}
                  </div>
                  <Button onClick={addCandidate} disabled={!newCandidate.trim() || loading} className="w-full">
                    {loading ? "Adding..." : "Add Candidate"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Voting Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="w-5 h-5" />
                  Cast Your Vote
                </CardTitle>
                <CardDescription>Select a candidate and cast your vote (one vote per address)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isOwner && (
                  <Alert className="mb-4 bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-600">
                      Note: Only the contract owner can add new candidates to the voting system.
                    </AlertDescription>
                  </Alert>
                )}
                {candidates.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No candidates available yet.{" "}
                      {isOwner ? "Add some candidates above." : "Wait for the owner to add candidates."}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid gap-3">
                    {candidates.map((candidate) => (
                      <div
                        key={candidate.bytes32Id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-medium capitalize">{candidate.id}</h3>
                            <p className="text-sm text-gray-500">
                              {candidate.votes} vote{candidate.votes !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => castVote(candidate.id)}
                          disabled={loading || hasVoted}
                          variant={hasVoted ? "secondary" : "default"}
                          size="sm"
                        >
                          {hasVoted ? "Voted" : "Vote"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {candidates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Results</CardTitle>
                  <CardDescription>Live vote counts for all candidates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {candidates
                      .sort((a, b) => b.votes - a.votes)
                      .map((candidate, index) => {
                        const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0)
                        const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0

                        return (
                          <div key={candidate.bytes32Id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {index === 0 && candidate.votes > 0 && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                                <span className="font-medium capitalize">{candidate.id}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold">{candidate.votes}</span>
                                <span className="text-sm text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contract Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-sm text-gray-500">
                  <p>
                    Contract Address: <code className="bg-gray-100 px-1 rounded">{CONTRACT_ADDRESS}</code>
                  </p>
                  <p className="mt-1">All candidate names are automatically converted to lowercase for consistency</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
