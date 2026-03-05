const signUp = (firstName, lastName, email, password) => {
    return fetch(`http://localhost:3333/user/create_account`,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "first_name": firstName,
                "last_name": lastName,
                "email": email,
                "password": password
            })
        }
    )
        .then(async (response) => {
            if (response.status === 201) {
                return response.json();
            }
            else if (response.status === 400) {
                const err = await response.json();
                throw err.error_message;
            }
            else {
                throw 'Something went wrong'
            }
        })
        .then((resJson) => {
            return resJson;
        })
        .catch((err) => {
            console.log("Err", err);
            return Promise.reject(err);
        })
}

const login = (email, password) => {
    return fetch(`http://localhost:3333/user/login`,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "email": email,
                "password": password
            })
        }
    )
        .then(async (response) => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 400) {
                const err = await response.json();
                throw err.error_message;
            } else if (response.status === 404) {
                const err = await response.json();
                throw err.error_message;
            } else {
                throw 'Something went wrong'
            }
        })
        .then((resJson) => {
            //localStorage.setItem("user_id", resJson.user_id);
            localStorage.setItem("sessionToken", resJson.session_token);
            //localStorage.setItem("email", email);
            return resJson;
        })
        .catch((err) => {
            console.log("Err", err);
            return Promise.reject(err);
        })
}

export const userService = {
    signUp,
    login,
}