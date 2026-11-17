export type Department = "procurement" | "sales";

export type AppPermissions = {
    canEdit: boolean;
    canDelete: boolean;
    canManageComments: boolean;
    canManageFilters: boolean;
    canAccessAdvancedFeatures: boolean;
};

export const DEPARTMENT_PERMISSIONS: Record<
    Department,
    AppPermissions
> = {
    sales: {
        canEdit: true,
        canDelete: true,
        canManageComments: true,
        canManageFilters: true,
        canAccessAdvancedFeatures: true,
    },

    procurement: {
        canEdit: false,
        canDelete: false,
        canManageComments: false,
        canManageFilters: true,
        canAccessAdvancedFeatures: false,
    },
};