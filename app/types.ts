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

export interface ClientRegisterData extends ClientLoginData {
    name: string
    confirmPassword: string
}

export interface EmployeeRegisterData extends EmployeeLoginData {
    name: string
    confirmPassword: string
    department: string
}

