import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Book, 
  Users, 
  Award, 
  Calendar, 
  MessageSquare, 
  Settings,
  PieChart,
  FileText,
  User,
  BarChart2,
  Bot,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  userRole: 'student' | 'teacher' | 'admin';
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  return (
    <div className="position-sticky pt-3 sidebar-sticky">
      <ul className="nav flex-column">
        <li className="nav-item">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
            }
          >
            <Home className="me-2" size={18} />
            Dashboard
          </NavLink>
        </li>
        
        <li className="nav-item">
          <NavLink 
            to="/courses" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
            }
          >
            <Book className="me-2" size={18} />
            Courses
          </NavLink>
        </li>
        
        {userRole === 'student' && (
          <>
            <li className="nav-item">
              <NavLink 
                to="/calendar" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <Calendar className="me-2" size={18} />
                Calendar
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/grades" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <Award className="me-2" size={18} />
                Grades
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/mentoring" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <Users className="me-2" size={18} />
                Peer Mentoring
              </NavLink>
            </li>
          </>
        )}
        
        {userRole === 'teacher' && (
          <>
            <li className="nav-item">
              <NavLink 
                to="/calendar" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <Calendar className="me-2" size={18} />
                Calendar
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/assignments" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <FileText className="me-2" size={18} />
                Assignments
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/students" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <Users className="me-2" size={18} />
                Students
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/analytics" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <BarChart2 className="me-2" size={18} />
                Analytics
              </NavLink>
            </li>
          </>
        )}
        
        {userRole === 'admin' && (
          <>
            <li className="nav-item">
              <NavLink 
                to="/admin/students" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <Users className="me-2" size={18} />
                Students
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/admin/teachers" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <Users className="me-2" size={18} />
                Teachers
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/admin/reports" 
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <PieChart className="me-2" size={18} />
                Reports
              </NavLink>
            </li>
          </>
        )}
        
        <li className="nav-item">
          <NavLink 
            to="/chatbot" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
            }
          >
            <Bot className="me-2" size={18} />
            AI Assistant
          </NavLink>
        </li>
        
        <li className="nav-item">
          <NavLink 
            to="/messages" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
            }
          >
            <MessageSquare className="me-2" size={18} />
            Messages
          </NavLink>
        </li>
        
        <li className="nav-item">
          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
            }
          >
            <User className="me-2" size={18} />
            Profile
          </NavLink>
        </li>
        
        <li className="nav-item">
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
            }
          >
            <Settings className="me-2" size={18} />
            Settings
          </NavLink>
        </li>
        
        <li className="nav-item">
          <NavLink 
            to="/help" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
            }
          >
            <HelpCircle className="me-2" size={18} />
            Help Center
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;