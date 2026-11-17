import {
    computed,
    inject,
    provide,
    type InjectionKey,
    type ComputedRef,
} from "vue";

import {
    DEPARTMENT_PERMISSIONS,
    type Department,
    type AppPermissions,
} from "@/configs/permissions";

type AccessContext = {
    department: ComputedRef<Department>;
    permissions: ComputedRef<AppPermissions>;
};

const ACCESS_KEY: InjectionKey<AccessContext> = Symbol("access");

export const provideAccess = (
    department: ComputedRef<Department>,
) => {
    const permissions = computed(
        () => DEPARTMENT_PERMISSIONS[department.value],
    );

    provide(ACCESS_KEY, {
        department,
        permissions,
    });
};

export const useAccess = () => {
    const access = inject(ACCESS_KEY);

    if (!access) {
        throw new Error(
            "useAccess must be used inside an authorized application",
        );
    }

    return access;
};