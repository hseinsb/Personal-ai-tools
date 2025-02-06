"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  // State declarations
  const [tools, setTools] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newTool, setNewTool] = useState({
    name: "",
    category: "",
    link: "",
    description: "",
  });
  const [editTool, setEditTool] = useState(null);
  const fileInputRef = useRef(null);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const correctPassword = "Hussein2002."; // Set your password here

  // Fetch tools from API
  async function fetchTools() {
    try {
      const res = await fetch("/api/tools");
      if (!res.ok) throw new Error("Failed to fetch tools");
      const data = await res.json();
      setTools(data);
    } catch (error) {
      console.error("Error fetching tools:", error);
    }
  }

  // Handle adding a tool
  const handleAddTool = async (e) => {
    e.preventDefault();
    console.log("📩 Sending tool data:", newTool);

    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTool),
      });

      let responseData;
      try {
        responseData = await res.json();
      } catch (jsonError) {
        console.error("❌ Failed to parse JSON response:", jsonError);
        responseData = { error: "Invalid response format from server" };
      }

      console.log("📩 API Response:", responseData);

      if (!res.ok) {
        console.error("❌ API Error:", responseData);
        throw new Error(responseData.error || "Failed to add tool");
      }

      alert("✅ Tool added successfully!");
      setShowAddForm(false);
      setNewTool({ name: "", category: "", link: "", description: "" });
      fetchTools();
    } catch (error) {
      console.error("❌ Error adding tool:", error);
      alert(`❌ Failed to add tool! ${error.message}`);
    }
  };

  // Handle editing a tool
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tools", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTool),
      });

      if (!res.ok) throw new Error("Failed to update tool");
      alert("Tool updated successfully!");
      setEditModalOpen(false);
      fetchTools();
    } catch (error) {
      console.error("Error updating tool:", error);
      alert("Failed to update tool!");
    }
  };

  // Handle deleting a tool
  const handleDeleteTool = async (id) => {
    try {
      const res = await fetch("/api/tools", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete tool");
      alert("Tool deleted successfully!");
      fetchTools();
    } catch (error) {
      console.error("Error deleting tool:", error);
      alert("Failed to delete tool!");
    }
  };

  // Export tools as CSV
  const handleExport = () => {
    fetch("/api/tools?export=true")
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "tools.csv");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => console.error("Error exporting tools:", error));
  };

  // Import tools from CSV
  const handleImport = async (e) => {
    e.preventDefault();

    try {
      const fileInput = fileInputRef.current;
      if (!fileInput?.files?.length) {
        alert("❌ No file selected!");
        return;
      }

      const csvFile = fileInput.files[0];
      const formData = new FormData();
      formData.append("file", csvFile);

      const res = await fetch("/api/tools", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to import tools");
      }

      const result = await res.json();
      alert(`✅ Successfully imported ${result.imported} tools!`);
      fetchTools();
    } catch (error) {
      console.error("❌ Error importing tools:", error);
      alert(`❌ Failed to import tools! ${error.message}`);
    }
  };

  // Persist favorites in localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavorites);
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Fetch tools on initial render
  useEffect(() => {
    fetchTools();
  }, []);

  // Password check handler
  const handleUnlock = () => {
    if (password === correctPassword) {
      setIsLocked(false);
    } else {
      alert("❌ Incorrect password!");
    }
  };

  // Render the lock screen if the website is locked
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-4">Enter Password</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-700 text-white mb-4"
            placeholder="Enter password"
          />
          <button
            onClick={handleUnlock}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  // Filter tools based on search query
  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-white mb-6">
          Personal AI Tools Organizer
        </h1>
        <p className="text-gray-400 mb-6">
          Organize, edit, and manage your favorite AI tools with ease!
        </p>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or category..."
            className="w-full p-3 rounded-lg bg-gray-700 text-white"
          />
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">⭐ Favorites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tools
                .filter((tool) => favorites.includes(tool.id))
                .map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-gray-800 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition relative"
                  >
                    <h2 className="text-xl font-bold">{tool.name}</h2>
                    <p className="text-sm text-gray-400">{tool.category}</p>
                    <p className="text-sm text-gray-300 mt-2">{tool.description}</p>
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline mt-2 inline-block"
                    >
                      Visit Tool
                    </a>
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => {
                          if (favorites.includes(tool.id)) {
                            setFavorites(favorites.filter((id) => id !== tool.id));
                          } else {
                            setFavorites([...favorites, tool.id]);
                          }
                        }}
                        className={`p-2 rounded-full ${
                          favorites.includes(tool.id) ? "bg-yellow-500" : "bg-gray-500"
                        } hover:bg-yellow-600 transition`}
                      >
                        ⭐
                      </button>
                      <button
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                        onClick={() => {
                          setEditTool(tool);
                          setEditModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        onClick={() => handleDeleteTool(tool.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Export & Import Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleExport}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition"
          >
            Export CSV
          </button>
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-orange-600 transition"
          >
            Import CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        {/* Add Tools Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-green-600 transition mb-6"
        >
          + Add Tools
        </button>

        {/* Add Tools Form */}
        {showAddForm && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <form onSubmit={handleAddTool}>
              <input
                type="text"
                placeholder="Tool Name"
                value={newTool.name}
                onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={newTool.category}
                onChange={(e) => setNewTool({ ...newTool, category: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4"
                required
              />
              <input
                type="url"
                placeholder="Link"
                value={newTool.link}
                onChange={(e) => setNewTool({ ...newTool, link: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4"
                required
              />
              <textarea
                placeholder="Description"
                value={newTool.description}
                onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Add Tool
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tools List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-gray-800 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition relative"
            >
              <h2 className="text-xl font-bold">{tool.name}</h2>
              <p className="text-sm text-gray-400">{tool.category}</p>
              <p className="text-sm text-gray-300 mt-2">{tool.description}</p>
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline mt-2 inline-block"
              >
                Visit Tool
              </a>
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => {
                    if (favorites.includes(tool.id)) {
                      setFavorites(favorites.filter((id) => id !== tool.id));
                    } else {
                      setFavorites([...favorites, tool.id]);
                    }
                  }}
                  className={`p-2 rounded-full ${
                    favorites.includes(tool.id) ? "bg-yellow-500" : "bg-gray-500"
                  } hover:bg-yellow-600 transition`}
                >
                  ⭐
                </button>
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                  onClick={() => {
                    setEditTool(tool);
                    setEditModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  onClick={() => handleDeleteTool(tool.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Tool Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-4">Edit Tool</h2>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                placeholder="Tool Name"
                value={editTool?.name || ""}
                onChange={(e) => setEditTool({ ...editTool, name: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={editTool?.category || ""}
                onChange={(e) => setEditTool({ ...editTool, category: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4"
                required
              />
              <input
                type="url"
                placeholder="Link"
                value={editTool?.link || ""}
                onChange={(e) => setEditTool({ ...editTool, link: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4"
                required
              />
              <textarea
                placeholder="Description"
                value={editTool?.description || ""}
                onChange={(e) => setEditTool({ ...editTool, description: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}