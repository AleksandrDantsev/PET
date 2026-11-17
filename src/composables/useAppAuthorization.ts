
import { computed, ref } from "vue";
import { LocalStorage } from "@/utils/localStorage";
import type { Ref } from "vue";
import type { Department } from "@/configs/permissions";

const AUTH_STORAGE_KEY = "app_department";

const DEPARTMENT_PASSWORDS: Record<Department, string> = {
    procurement: "1234",
    sales: "4321",
};

const isValidDepartment = (
    value: unknown,
): value is Department => {
    return value === "procurement" || value === "sales";
};

export const useAppAuthorization = () => {
    const savedDepartment = LocalStorage.get<Department>(
        AUTH_STORAGE_KEY,
    );

    const authorizedDepartment: Ref<Department | null> = ref<Department | null>(
        isValidDepartment(savedDepartment) ? savedDepartment : null,
    );

    const isAuthorized = computed(
        () => authorizedDepartment.value !== null,
    );

    const authError = ref("");

    const handleAuthorization = ({
        department,
        password,
    }: {
        department: Department;
        password: string;
    }): boolean => {
        authError.value = "";

        if (DEPARTMENT_PASSWORDS[department] !== password) {
            authError.value = "Неверный пароль";
            return false;
        }

        authorizedDepartment.value = department;

        LocalStorage.save(AUTH_STORAGE_KEY, department);

        return true;
    };

    const logout = () => {
        authorizedDepartment.value = null;
        authError.value = "";
        LocalStorage.remove(AUTH_STORAGE_KEY);
    };

    return {
        authorizedDepartment,
        isAuthorized,
        authError,
        handleAuthorization,
        logout,
    };
};
