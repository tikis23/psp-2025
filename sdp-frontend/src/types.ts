export interface User {
  name: string
  email: string
  role: string
}

export interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean // To handle the initial auth check loading state
  login: (username: string, password: string) => Promise<void> // Throws error on failure
  logout: () => Promise<void>
  checkAuthStatus: () => Promise<void> // Function to re-check auth status
  changePassword: (
    oldPassword: string,
    newPassword: string,
    username: string
  ) => Promise<void>
}

export interface LocationState {
  from?: {
    pathname: string
  }
}