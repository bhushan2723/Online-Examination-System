import React from "react";

export default function LoginFieldsUI({ formData, errors, handleChange }) {
  return (
    <>
      <div className="mb-3 d-flex flex-column align-items-start">
        <label htmlFor="username" className="form-label text-secondary small">
          Username
        </label>
        <input
          type="text"
          className={`form-control input-focus ${
            errors.username ? "is-invalid" : ""
          }`}
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter username"
        />
        {errors.username && (
          <div className="invalid-feedback">{errors.username}</div>
        )}
      </div>

      <div className="mb-3 d-flex flex-column align-items-start">
        <label htmlFor="password" className="form-label text-secondary small">
          Password
        </label>
        <input
          type="password"
          className={`form-control input-focus ${
            errors.password ? "is-invalid" : ""
          }`}
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
        />
        {errors.password && (
          <div className="invalid-feedback">{errors.password}</div>
        )}
      </div>

      <div className="text-end mt-1">
        <button type="button" className="link-green btn btn-link p-0 small mb-1">
          Forgot password?
        </button>
      </div>
    </>
  );
}
