
export const PERMISSIONS = {
    // Dashboard
    VIEW_DASHBOARD: 'view_dashboard',

    // Agenda
    VIEW_AGENDA: 'view_agenda',
    MANAGE_AGENDA: 'manage_agenda',

    // Patients
    VIEW_PATIENTS: 'view_patients',
    MANAGE_PATIENTS: 'manage_patients',

    // EMR (Expedientes)
    VIEW_EMR: 'view_emr',
    MANAGE_EMR: 'manage_emr',

    // Physiotherapists
    VIEW_PHYSIOS: 'view_physios',
    MANAGE_PHYSIOS: 'manage_physios',

    // Users (Admin)
    VIEW_USERS: 'view_users',
    MANAGE_USERS: 'manage_users',

    // Finance
    VIEW_FINANCE: 'view_finance',
    MANAGE_FINANCE: 'manage_finance',

    // Exercises
    VIEW_EXERCISES: 'view_exercises',
    MANAGE_EXERCISES: 'manage_exercises',

    // Templates
    VIEW_TEMPLATES: 'view_templates',
    MANAGE_TEMPLATES: 'manage_templates',

    // Settings
    VIEW_SETTINGS: 'view_settings',
    MANAGE_SETTINGS: 'manage_settings',

    // Roles (Super Admin only usually, but good to have)
    MANAGE_ROLES: 'manage_roles',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export function hasPermission(userPermissions: string[] | undefined | null, requiredPermission: Permission): boolean {
    if (!userPermissions) return false;
    if (userPermissions.includes('*')) return true; // Super Admin wildcard
    return userPermissions.includes(requiredPermission);
}
