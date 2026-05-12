describe('Invalid Login Flow', () => {
  it('should show an error message when invalid credentials are used', () => {
    cy.visit('http://localhost:3000'); // adjust if needed

    // Enter username (email)
    cy.get('[data-cy=login-email]').type('JohnDoe');

    // Enter wrong password
    cy.get('[data-cy=register-password]').type('WrongPass123');

    // Submit
    cy.get('[data-cy=register-submit]').click();

    // Verify error message
    cy.get('[data-cy=register-error]')
      .should('contain.text', 'Invalid username or password');
  });
});
