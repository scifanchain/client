import React from "react"
import { Redirect, Route } from "react-router"
import { GetAuthorToken } from "./utils/Storage"

export const PrivateRoute = ({ component, ...rest }) => (
    <Route {...rest} render={(props) => (
        GetAuthorToken() ? (
            React.createElement(component, props)
        ) : (
            <Redirect to={{ pathname: '/sign-in' }} />
        )
    )} />
)