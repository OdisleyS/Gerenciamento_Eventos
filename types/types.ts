export type UserType = "client" | "employee"

export interface LoginFormData {
    email: string
    password: string
}

export interface ClientLoginData extends LoginFormData {
    clientId: string
}

export interface EmployeeLoginData extends LoginFormData {
    SemployeeId: string
    email: string;
    password: string;
    employeeId: string; // Adicione essa linha se não existir
}

export interface RegisterFormValues {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }


