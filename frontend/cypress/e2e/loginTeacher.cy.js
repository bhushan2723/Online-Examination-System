describe('Teacher Login Flow', () => {
  it('should allow a teacher to login with valid credentials', () => {
    // Step 1: Visit login page
    cy.visit('http://localhost:3000'); // adjust if needed

    // Step 2: Enter Email
    cy.get('[data-cy=login-email]').type('JohnDoe');

    // Step 3: Enter Password
    cy.get('[data-cy=register-password]').type('P@ssw0rd');

    // Step 5: Click Login Button
    cy.get('[data-cy=register-submit]').click();

    // Step 6: Validate successful login
    cy.url().should('include', '/teacher-dashboard'); // adjust route
    cy.get('[data-cy=welcome-message]')
      .should('contain.text', 'Welcome back JohnDoe 👋');
  });
});
