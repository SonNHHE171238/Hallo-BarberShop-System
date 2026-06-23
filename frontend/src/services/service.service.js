import { fetchWithAuth } from './api';

export const customerServiceApi = {
    getAllServices: async () => {
        // Chúng ta có thể dùng fetchWithAuth vì backend route này không yêu cầu token,
        // nhưng fetchWithAuth có logic bóc tách response { data, success } tự động rất tiện
        return fetchWithAuth('/services', {
            method: 'GET',
        });
    }
};
