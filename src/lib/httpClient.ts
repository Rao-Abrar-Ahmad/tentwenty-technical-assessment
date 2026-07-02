const defaultOptions: RequestInit = {
    headers: {
        "Content-Type": "application/json",
    },
};

function buildFetchOptions(options: RequestInit = {}): RequestInit {
    return {
        ...defaultOptions,
        ...options,
        headers: {
            ...(defaultOptions.headers ?? {}),
            ...(options.headers ?? {}),
        },
    };
}

export async function httpClient<T>(
    url: string,
    options: RequestInit = {}
): Promise<T | null> {
    try {
        const fetchOptions = buildFetchOptions(options);

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {

            console.log(
                (await response.text()) ||
                `Request failed: ${response.status} ${response.statusText}`
            );
            return null;
        }

        const result = await response.json();
        return result as T;
    } catch (error) {
        console.error("HTTP Client Error:", error);
        return null;
    }
}