# Student Management System

A comprehensive web-based Student Management System designed for educational institutions. This application provides complete functionality for managing students, courses, attendance, grades, and academic reports with role-based access control.

## Features

### 🔐 Authentication & Authorization
- **Replit OAuth Integration**: Secure authentication using OpenID Connect
- **Role-Based Access Control**: Three user roles with specific permissions
  - **Admin**: Full system access and user management
  - **Teacher**: Course and student management within assigned courses
  - **Student**: Personal profile and academic record access
- **Session Management**: Secure server-side sessions with PostgreSQL storage

### 👥 Student Management
- Complete student profile management
- Student enrollment and status tracking
- Academic history and progress monitoring
- Student search and filtering capabilities

### 📚 Course Management
- Course creation and administration
- Teacher assignment to courses
- Student enrollment management
- Course scheduling and information

### ✅ Attendance Tracking
- Real-time attendance marking
- Attendance history and analytics
- Multiple attendance statuses (Present, Absent, Late, Excused)
- Date-based attendance reports

### 📊 Grade Management
- Comprehensive gradebook functionality
- Assessment creation and management
- Grade entry and calculation
- Letter grade assignment with customizable scales
- Student performance analytics

### 📈 Dashboard & Reports
- Role-specific dashboard views
- Quick action panels for common tasks
- Statistical overview and analytics
- Exportable reports for academic records
- Attendance and performance insights

### ⚙️ System Settings
- Admin configuration panel
- User role management
- System preferences and customization
- Database management tools

## Technology Stack

### Frontend
- **React 18** with TypeScript for modern UI development
- **Tailwind CSS** with shadcn/ui component library
- **Wouter** for lightweight client-side routing
- **TanStack React Query** for efficient data fetching and caching
- **React Hook Form** with Zod validation for robust form handling

### Backend
- **Node.js** with Express.js for RESTful API
- **TypeScript** for type-safe server-side development
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** for reliable data persistence
- **Session-based authentication** with connect-pg-simple

### Development Tools
- **Vite** for fast development and optimized builds
- **ESBuild** for efficient TypeScript compilation
- **PostCSS** with Tailwind CSS processing
- **Drizzle Kit** for database migrations

## Installation

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Replit account (for authentication)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Blessed-jacobs/student-management-system.git
   cd student-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file with the following variables:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret
   REPL_ID=your_replit_app_id
   REPLIT_DOMAINS=your_replit_domain
   ISSUER_URL=https://replit.com/oidc
   ```

4. **Database Setup:**
   ```bash
   npm run db:push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Usage

### Getting Started

1. **Access the Application**: Navigate to your application URL
2. **Sign In**: Use the "Sign In" button to authenticate via Replit OAuth
3. **Role Assignment**: Admin users can assign roles to new users
4. **Explore Features**: Access features based on your assigned role

### For Administrators
- Manage users and assign roles
- Create and configure courses
- Monitor system-wide statistics
- Generate comprehensive reports

### For Teachers
- Manage assigned courses
- Track student attendance
- Create assessments and enter grades
- View student performance analytics

### For Students
- View personal academic information
- Check attendance records
- Access grades and feedback
- Update profile information

## Database Schema

The system uses a normalized PostgreSQL schema with the following core entities:

- **Users**: Authentication and basic user information
- **Students**: Student-specific profile data
- **Courses**: Course information and settings
- **Enrollments**: Student-course relationships
- **Attendance**: Daily attendance records
- **Assessments**: Tests, assignments, and evaluations
- **Grades**: Student performance data
- **Sessions**: Secure session management

## API Documentation

### Authentication Endpoints
- `GET /api/auth/user` - Get current user information
- `GET /api/login` - Initiate OAuth login flow
- `GET /api/logout` - Logout and clear session

### Student Management
- `GET /api/students` - List all students
- `POST /api/students` - Create new student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student information
- `DELETE /api/students/:id` - Remove student

### Course Management
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course information

### Attendance & Grades
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/grades` - Get grade records
- `POST /api/grades` - Enter grades

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Features

- **Secure Authentication**: OAuth 2.0/OpenID Connect integration
- **Role-Based Authorization**: Granular permission control
- **Session Security**: HTTP-only, secure cookies
- **Input Validation**: Comprehensive data validation with Zod
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **CSRF Protection**: Built-in Express security middleware

## Performance Features

- **Optimized Queries**: Efficient database operations with proper indexing
- **Caching**: Client-side caching with React Query
- **Code Splitting**: Optimized bundle loading
- **Responsive Design**: Mobile-first approach for all devices
- **Fast Development**: Hot module replacement with Vite

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

## Acknowledgments

- Built with modern web technologies and best practices
- Designed for educational institutions of all sizes
- Focused on user experience and administrative efficiency

---

**Student Management System** - Empowering education through technology.