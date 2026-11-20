import { computed, ref } from "vue";
import { LocalStorage } from "@/utils/localStorage";
import type { Department } from "@/configs/permissions";

const AUTH_STORAGE_KEY = "app_department";

const DEPARTMENT_PIN_CODES: Record<Department, string> = {
    procurement: "1234",
    sales: "4321",
};

const isValidDepartment = (
    value: unknown,
): value is Department => {
    return value === "procurement" || value === "sales";
};

const savedDepartment = LocalStorage.get<Department>(
    AUTH_STORAGE_KEY,
);

const authorizedDepartment = ref<Department | null>(
    isValidDepartment(savedDepartment) ? savedDepartment : null,
);

const isAuthorized = computed(
    () => authorizedDepartment.value !== null,
);

const authError = ref("");

export const useAppAuthorization = () => {
    function handleAuthorization({
        department,
        pinCode,
    }: {
        department: Department;
        pinCode: string;
    }): boolean {
        authError.value = "";

        if (DEPARTMENT_PIN_CODES[department] !== pinCode) {
            authError.value = "Неверный PIN-код";
            return false;
        }

        authorizedDepartment.value = department;

        LocalStorage.save(AUTH_STORAGE_KEY, department);

        return true;
    }

    function logout() {
        authorizedDepartment.value = null;
        authError.value = "";
        LocalStorage.remove(AUTH_STORAGE_KEY);
    }

    return {
        authorizedDepartment,
        isAuthorized,
        authError,
        handleAuthorization,
        logout,
    };
};