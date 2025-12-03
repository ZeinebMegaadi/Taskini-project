import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './HomePage.css';
// use inline Blocknote component to ensure animations run reliably
import Blocknote from '../../components/Blocknote/Blocknote';
import GoalGraph from '../../components/GoalGraph/GoalGraph';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [productivityScore, setProductivityScore] = useState(0);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);
  const [weather, setWeather] = useState({ temp: 72, condition: 'sunny' });
  const [achievements, setAchievements] = useState([]);
  const [focusTime, setFocusTime] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      fetchUserData();
      initializeUserFeatures();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const initializeUserFeatures = () => {
    // Mock weather data
    setWeather({
      temp: Math.floor(Math.random() * 30) + 60,
      condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
    });

    // Mock achievements
    setAchievements([
      { id: 1, name: 'Early Bird', icon: '', unlocked: true },
      { id: 2, name: 'Task Master', icon: '', unlocked: true },
      { id: 3, name: 'Productivity Guru', icon: '', unlocked: false },
      { id: 4, name: 'Consistency King', icon: '', unlocked: false }
    ]);

    // Mock focus time (in minutes)
    setFocusTime(Math.floor(Math.random() * 240));
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get('/tasks');
      if (response.data.success) {
        setAllTasks(response.data.data || []);
        const tasks = response.data.data;
        calculateStats(tasks);
        getRecentTasks(tasks);
        getUpcomingTasks(tasks);
        calculateProductivity(tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    const mockTasks = [
      {
        _id: '1',
        title: 'Welcome to Taskini',
        description: 'Get started with your first task',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'Explore features',
        description: 'Check out all the amazing features',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        _id: '3',
        title: 'Invite team members',
        description: 'Share Taskini with your team',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        _id: '4',
        title: 'Set up weekly goals',
        description: 'Plan your upcoming week',
        status: 'pending',
        priority: 'low',
        dueDate: new Date(Date.now() + 259200000).toISOString(),
        createdAt: new Date().toISOString()
      }
    ];
    setAllTasks(mockTasks);
    calculateStats(mockTasks);
    getRecentTasks(mockTasks);
    getUpcomingTasks(mockTasks);
    calculateProductivity(mockTasks);
  };

  const getLast7Counts = () => {
    const arr = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0,0,0,0);
      const count = (allTasks || []).filter(task => {
        // Count tasks that were completed on that day; fall back to createdAt for counting if updatedAt missing
        const time = task.updatedAt || task.createdAt || task.dueDate;
        if (!time) return false;
        const t = new Date(time);
        t.setHours(0,0,0,0);
        return t.getTime() === d.getTime() && task.status === 'completed';
      }).length;
      arr.push(count);
    }
    return arr;
  };

  const getTaskDistribution = () => {
    const dist = { completed: 0, 'in-progress': 0, pending: 0, other: 0 };
    (allTasks || []).forEach(t => {
      if (t.status === 'completed') dist.completed += 1;
      else if (t.status === 'in-progress') dist['in-progress'] += 1;
      else if (t.status === 'pending') dist.pending += 1;
      else dist.other += 1;
    });
    return dist;
  };

  const calculateStats = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const pending = tasks.filter(task => task.status === 'pending' || task.status === 'in-progress').length;
    const overdue = tasks.filter(task => 
      new Date(task.dueDate) < new Date() && task.status !== 'completed'
    ).length;

    setStats({ total, completed, pending, overdue });
  };

  const getRecentTasks = (tasks) => {
    const recent = tasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
    setRecentTasks(recent);
  };

  const getUpcomingTasks = (tasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = tasks
      .filter(task => new Date(task.dueDate) >= today && task.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 4);
    
    setUpcomingTasks(upcoming);
  };

  const calculateProductivity = (tasks) => {
    if (tasks.length === 0) {
      setProductivityScore(100);
      return;
    }

    const completed = tasks.filter(task => task.status === 'completed').length;
    const score = Math.round((completed / tasks.length) * 100);
    setProductivityScore(isNaN(score) ? 0 : score);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "The way to get started is to quit talking and begin doing. - Walt Disney",
      "Don't let yesterday take up too much of today. - Will Rogers",
      "It's not whether you get knocked down, it's whether you get up. - Vince Lombardi",
      "The future depends on what you do today. - Mahatma Gandhi",
      "The only limit to our realization of tomorrow is our doubts of today. - Franklin D. Roosevelt",
      "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort. - Paul J. Meyer"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'create-task':
        navigate('/tasks');
        break;
      case 'view-calendar':
        navigate('/calendar');
        break;
      case 'view-profile':
        navigate('/profile');
        break;
      case 'focus-mode':
        startFocusMode();
        break;
      default:
        break;
    }
  };

  const startFocusMode = () => {
    // Implement focus mode functionality
    alert('🎯 Focus Mode Activated! Minimizing distractions...');
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️'
    };
    return icons[condition] || '🌈';
  };

  const getDailyGoalProgress = () => {
    const completedToday = recentTasks.filter(task => 
      task.status === 'completed' && 
      new Date(task.updatedAt).toDateString() === new Date().toDateString()
    ).length;
    return Math.min((completedToday / dailyGoal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="homepage-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Enhanced Animated Background */}
      <div className="animated-background">
        <div className="floating-shapes">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`shape shape-${i + 1}`}></div>
          ))}
        </div>
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}></div>
          ))}
        </div>
      </div>

      {user ? (
        /* Enhanced User Dashboard */
        <div className="dashboard">
          {/* Welcome Section with Weather */}
          <section className="welcome-section">
            <div className="welcome-content">
              <div className="welcome-text">
                <div className="welcome-header">
                  <h1>{getGreeting()}, {user.name}! </h1>
                </div>
                <p className="welcome-subtitle">{getMotivationalQuote()}</p>
                
                {/* Daily Goal Progress (graph) */}
                <div className="daily-goal">
                  <GoalGraph
                    history={getLast7Counts()}
                    distribution={getTaskDistribution()}
                  />
                </div>

                <div className="welcome-actions">
                  <button 
                    className="btn btn-primary btn-large"
                    onClick={() => handleQuickAction('create-task')}
                  >
                    <span className="btn-icon"></span>
                    Quick Add Task
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleQuickAction('view-calendar')}
                  >
                    <span className="btn-icon"></span>
                    View Calendar
                  </button>
                  <button 
                    className="btn btn-accent"
                    onClick={() => handleQuickAction('focus-mode')}
                  >
                    <span className="btn-icon"></span>
                    Focus Mode
                  </button>
                </div>
              </div>
                <div className="welcome-visual">
                <div className="productivity-card">
                  <div className="productivity-score">
                    <div className="score-circle"></div>
                  </div>
                </div>
                <Blocknote className="blocknote-image" />
              </div>
            </div>
          </section>

          {/* Enhanced Stats Grid */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card primary glow">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <div className="stat-number">{stats.total}</div>
                  <div className="stat-label">Total Tasks</div>
                </div>
                <div className="stat-trend"> All Time</div>
              </div>
              
              <div className="stat-card success glow">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.completed}</div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-trend">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% done
                </div>
              </div>
              
              <div className="stat-card warning glow">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.pending}</div>
                  <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-trend">Needs attention</div>
              </div>
              
              <div className="stat-card danger glow">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <div className="stat-number">{stats.overdue}</div>
                  <div className="stat-label">Overdue</div>
                </div>
                <div className="stat-trend">Urgent action needed</div>
              </div>
            </div>
          </section>

          {/* Enhanced Quick Actions & Activity */}
          <section className="quick-actions-section">
            <div className="actions-grid">
              {/* Enhanced Quick Actions */}
              <div className="actions-card">
                <h3> Quick Actions</h3>
                <div className="quick-actions">
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('create-task')}
                  >
                    <span className="action-icon">➕</span>
                    <span className="action-text">Add Task</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('view-calendar')}
                  >
                    <span className="action-icon"></span>
                    <span className="action-text">Calendar</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('view-profile')}
                  >
                    <span className="action-icon">👤</span>
                    <span className="action-text">Profile</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Recent Tasks */}
              <div className="recent-tasks-card">
                <div className="card-header">
                  <h3>Recent Tasks</h3>
                  <span className="badge">{recentTasks.length}</span>
                </div>
                {recentTasks.length > 0 ? (
                  <div className="tasks-list">
                    {recentTasks.map(task => (
                      <div key={task._id} className="task-item" onClick={() => navigate('/tasks')}>
                        <div className="task-main">
                          <span className="task-title">{task.title}</span>
                          <span className="task-date">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`task-status ${task.status} ${task.priority}`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    <span className="no-data-icon"></span>
                    <p>No recent tasks</p>
                  </div>
                )}
                <button 
                  className="btn-view-all"
                  onClick={() => navigate('/tasks')}
                >
                  View All Tasks →
                </button>
              </div>

              {/* Enhanced Upcoming Deadlines */}
              <div className="upcoming-card">
                <div className="card-header">
                  <h3> Upcoming Deadlines</h3>
                  <span className="badge urgent">{upcomingTasks.length}</span>
                </div>
                {upcomingTasks.length > 0 ? (
                  <div className="upcoming-list">
                    {upcomingTasks.map(task => (
                      <div key={task._id} className="upcoming-item" onClick={() => navigate('/tasks')}>
                        <div className="upcoming-main">
                          <span className="upcoming-title">{task.title}</span>
                          <span className="upcoming-date">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`priority-indicator ${task.priority}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    <span className="no-data-icon">🎉</span>
                    <p>All caught up!</p>
                  </div>
                )}
              </div>

              {/* Achievements Section */}
              <div className="achievements-card">
                <h3> Your Achievements</h3>
                <div className="achievements-grid">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className={`achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                      <span className="achievement-icon">{achievement.icon}</span>
                      <span className="achievement-name">{achievement.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Features Showcase */}
          <section className="features-showcase">
            <h2> Why Taskini Stands Out</h2>
            <div className="features-carousel">
              <div className="feature-highlight">
                <div className="feature-visual">
                  <div className={`feature-demo ${activeFeature === 0 ? 'active' : ''}`}>
                    <div className="demo-calendar">
                      <div className="demo-day today">15</div>
                      <div className="demo-events">
                        <div className="demo-event meeting">Team Meeting</div>
                        <div className="demo-event deadline">Project Due</div>
                      </div>
                    </div>
                  </div>
                  <div className={`feature-demo ${activeFeature === 1 ? 'active' : ''}`}>
                    <div className="demo-tasks">
                      <div className="demo-task completed">Design Homepage ✓</div>
                      <div className="demo-task in-progress">Write Documentation...</div>
                      <div className="demo-task pending">Review PR</div>
                    </div>
                  </div>
                  <div className={`feature-demo ${activeFeature === 2 ? 'active' : ''}`}>
                    <div className="demo-analytics">
                      <div className="analytics-chart">
                        <div className="chart-bar" style={{height: '80%'}}></div>
                        <div className="chart-bar" style={{height: '60%'}}></div>
                        <div className="chart-bar" style={{height: '90%'}}></div>
                      </div>
                    </div>
                  </div>
                  <div className={`feature-demo ${activeFeature === 3 ? 'active' : ''}`}>
                    <div className="demo-mobile">
                      <div className="mobile-screen">
                        <div className="mobile-task">Mobile Task</div>
                        <div className="mobile-task">Sync Complete</div>
                      </div>
                    </div>
                  </div>
                  <div className={`feature-demo ${activeFeature === 4 ? 'active' : ''}`}>
                    <div className="demo-collaboration">
                      <div className="team-avatars">
                        <div className="avatar"></div>
                        <div className="avatar"></div>
                        <div className="avatar"></div>
                      </div>
                    </div>
                  </div>
                  <div className={`feature-demo ${activeFeature === 5 ? 'active' : ''}`}>
                    <div className="demo-security">
                      <div className="shield"></div>
                    </div>
                  </div>
                </div>
                <div className="feature-content">
                  <div className={`feature-text ${activeFeature === 0 ? 'active' : ''}`}>
                    <h3> Smart Calendar Integration</h3>
                    <p>Visualize your tasks on an interactive calendar. Drag and drop to reschedule, set smart reminders, and never miss a deadline with our intelligent scheduling system.</p>
                    <button className="feature-cta">Try Calendar →</button>
                  </div>
                  <div className={`feature-text ${activeFeature === 1 ? 'active' : ''}`}>
                    <h3> Intelligent Task Management</h3>
                    <p>Create, organize, and prioritize tasks with AI-powered suggestions, automated categorization, and smart workflows that adapt to your working style.</p>
                    <button className="feature-cta">Explore Tasks →</button>
                  </div>
                  <div className={`feature-text ${activeFeature === 2 ? 'active' : ''}`}>
                    <h3> Advanced Productivity Analytics</h3>
                    <p>Track your progress with detailed insights, personalized recommendations, and predictive analytics to continuously boost your efficiency and achieve your goals faster.</p>
                    <button className="feature-cta">View Analytics →</button>
                  </div>
                  <div className={`feature-text ${activeFeature === 3 ? 'active' : ''}`}>
                    <h3> Seamless Cross-Platform Sync</h3>
                    <p>Access your tasks anywhere with real-time synchronization across all your devices. Work offline and sync automatically when you're back online.</p>
                    <button className="feature-cta">Sync Devices →</button>
                  </div>
                  <div className={`feature-text ${activeFeature === 4 ? 'active' : ''}`}>
                    <h3>Powerful Team Collaboration</h3>
                    <p>Share tasks, assign responsibilities, track team progress, and collaborate in real-time with integrated chat, comments, and file sharing.</p>
                    <button className="feature-cta">Invite Team →</button>
                  </div>
                  <div className={`feature-text ${activeFeature === 5 ? 'active' : ''}`}>
                    <h3>Enterprise-Grade Security</h3>
                    <p>Your data is protected with bank-level encryption, privacy-first architecture, and regular security audits. GDPR compliant and enterprise ready.</p>
                    <button className="feature-cta">Learn More →</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Productivity Tips */}
          <section className="productivity-tips">
            <h3> Productivity Tip of the Day</h3>
            <div className="tip-card">
              <p>"Break large tasks into smaller, manageable chunks. Completing these smaller pieces will give you a sense of progress and momentum."</p>
              <span className="tip-source">- The 2-Minute Rule</span>
            </div>
          </section>
        </div>
      ) : (
        /* Enhanced Public Landing Page */
        <div className="landing-page">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <div className="hero-text">
                <h1>
                  <span className="hero-gradient">Organize Your Life,</span>
                  <br />
                  <span className="hero-gradient">Amplify Your Productivity</span>
                </h1>
                <p className="hero-subtitle">
                  Taskini is the all-in-one task management platform that helps individuals and teams achieve more with less stress. 
                  From simple to-do lists to complex project management, we've got you covered.
                </p>
                <div className="hero-actions">
                  <Link to="/register" className="btn btn-primary btn-large glow">
                    <span className="btn-icon"></span>
                    Start Free Today
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-large">
                    <span className="btn-icon"></span>
                    Sign In
                  </Link>
                </div>
                <div className="hero-stats">
                  <div className="stat">
                    <div className="stat-number">10K+</div>
                    <div className="stat-label">Active Users</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">500K+</div>
                    <div className="stat-label">Tasks Completed</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">99.9%</div>
                    <div className="stat-label">Uptime</div>
                  </div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="app-preview">
                  <div className="preview-screen">
                    <div className="screen-header">
                      <div className="header-left">
                        <span className="app-logo">✅</span>
                        <span className="app-name">Taskini</span>
                      </div>
                      <div className="header-right">
                        <span className="time">2:30 PM</span>
                      </div>
                    </div>
                    <div className="screen-content">
                      <div className="task-preview completed">
                        <span className="task-check">✓</span>
                        <span className="task-text">Complete onboarding</span>
                      </div>
                      <div className="task-preview in-progress">
                        <span className="task-check">⟳</span>
                        <span className="task-text">Design homepage</span>
                      </div>
                      <div className="task-preview pending">
                        <span className="task-check">○</span>
                        <span className="task-text">Write documentation</span>
                      </div>
                      <div className="task-preview high-priority">
                        <span className="task-check"></span>
                        <span className="task-text">Launch campaign</span>
                      </div>
                      <div className="add-task-button">
                        <span>+ Add new task</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <div className="container">
              <div className="section-header">
                <h2>Everything You Need to Succeed</h2>
                <p>Powerful features designed to streamline your workflow and boost productivity</p>
              </div>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon"></div>
                  <h3>Smart Task Management</h3>
                  <p>Create, organize, and prioritize tasks with intelligent suggestions and automated workflows.</p>
                  <ul className="feature-list">
                    <li>Recurring tasks</li>
                    <li>Priority levels</li>
                    <li>Deadline tracking</li>
                    <li>Smart categorization</li>
                  </ul>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon"></div>
                  <h3>Interactive Calendar</h3>
                  <p>Visualize your schedule with a beautiful, interactive calendar that syncs with your tasks.</p>
                  <ul className="feature-list">
                    <li>Drag & drop scheduling</li>
                    <li>Multiple views</li>
                    <li>Smart reminders</li>
                    <li>Time blocking</li>
                  </ul>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon"></div>
                  <h3>Advanced Analytics</h3>
                  <p>Gain insights into your productivity patterns with detailed analytics and reports.</p>
                  <ul className="feature-list">
                    <li>Progress tracking</li>
                    <li>Productivity scores</li>
                    <li>Custom reports</li>
                    <li>Goal setting</li>
                  </ul>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon"></div>
                  <h3>Team Collaboration</h3>
                  <p>Work together seamlessly with shared tasks, comments, and real-time updates.</p>
                  <ul className="feature-list">
                    <li>Task assignments</li>
                    <li>Team calendars</li>
                    <li>Progress sharing</li>
                    <li>File attachments</li>
                  </ul>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon"></div>
                  <h3>Enterprise Security</h3>
                  <p>Your data is protected with military-grade encryption and privacy-first design.</p>
                  <ul className="feature-list">
                    <li>End-to-end encryption</li>
                    <li>GDPR compliant</li>
                    <li>Regular backups</li>
                    <li>SSO integration</li>
                  </ul>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon"></div>
                  <h3>Cross-Platform</h3>
                  <p>Access your tasks from anywhere with our web, mobile, and desktop applications.</p>
                  <ul className="feature-list">
                    <li>Progressive Web App</li>
                    <li>Mobile apps</li>
                    <li>Offline support</li>
                    <li>Smart sync</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <div className="cta-content">
              <h2>Ready to Transform Your Productivity?</h2>
              <p>Join thousands of users who have already revolutionized their task management with Taskini.</p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-large glow">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Sign In
                </Link>
              </div>
              <div className="cta-features">
                <div className="cta-feature">✓ No credit card required</div>
                <div className="cta-feature">✓ Free forever plan</div>
                <div className="cta-feature">✓ Setup in 2 minutes</div>
                <div className="cta-feature">✓ 24/7 Support</div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default HomePage;