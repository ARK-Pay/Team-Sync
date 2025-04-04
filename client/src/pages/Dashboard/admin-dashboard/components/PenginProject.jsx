import { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios
import { Filter } from 'lucide-react';
import { SearchBar } from './common/SearchBar';
import { TableHeader } from './table/TableHeader';
import { ProjectRow } from './table/ProjectRow';

const PendingProject = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]); // State to store projects
  const [filteredProjects, setFilteredProjects] = useState([]); // State for filtered projects
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  const fetchProjects = async () => {
    console.log("fetching");
    try {
      const token = localStorage.getItem('token'); // Get token from local storage
      const response = await axios.get('http://localhost:3001/admin/all-projects', {
        headers: {
          'authorization': token, // Set Authorization header without 'Bearer' prefix
          'Content-Type': 'application/json' // Set content type
        },
      });

      setProjects(response.data); // Set the projects state
      setFilteredProjects(response.data); // Set the filtered projects to initial projects
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message); // Handle any errors
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchProjects(); // Call the function to fetch projects
  }, []);

  // Handle project approval
  const handleProjectApproved = (projectId) => {
    // Remove the approved project from the filtered list
    const updatedFilteredProjects = filteredProjects.filter(project => project.id !== projectId);
    setFilteredProjects(updatedFilteredProjects);
    
    // Also update the main projects list
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return { ...project, is_approved: true, status: 'approved' };
      }
      return project;
    });
    setProjects(updatedProjects);
  };

  // Search function
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent default form submission
    const filtered = projects.filter((project) => {
      const { name, description } = project;
      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        name.toLowerCase().includes(lowerCaseQuery) ||
        description.toLowerCase().includes(lowerCaseQuery) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))) // Check tags if they exist
      );
    });
    setFilteredProjects(filtered); // Set the filtered projects
  };

  // If loading, display a loading message
  if (loading) {
    return <div>Loading projects...</div>;
  }

  // If there's an error, display an error message
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="py-6 max-w-[1200px] mx-auto">
      <form onSubmit={handleSearch} className="flex justify-between items-center mb-8">
        <div className="hidden lg:block font-medium text-lg">Table view</div>
        <div className="flex gap-4">
          <SearchBar 
            placeholder="Search for projects.."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </form>

      <div className="border border-gray-300 rounded-lg overflow-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead className="bg-gray-100 border-b border-gray-300">
            <TableHeader />
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                !project.is_approved && <ProjectRow 
                  key={project.id} 
                  project={project} 
                  onProjectApproved={handleProjectApproved}
                />
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">No projects waiting for approval</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingProject;
