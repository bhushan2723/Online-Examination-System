describe('Registration Flow', () => {
  it('should allow a new user to register successfully as a teacher', () => {
    cy.visit('http://localhost:3000/'); // adjust if needed
    
    // Switch to registration view
    cy.get('[data-cy=toggle-auth-view]').click();
    
    // Fill form
    cy.get('[data-cy=register-email]').type('johnny.doe@example.com');
    cy.get('[data-cy=register-username]').type('JohnDoe');
    cy.get('[data-cy=register-role]').select('Teacher');
    cy.get('[data-cy=register-password]').type('P@ssw0rd');
    cy.get('[data-cy=register-confirm-password]').type('P@ssw0rd');
    
    // Submit
    cy.get('[data-cy=register-submit]').click();
    
    // Check success message
    cy.get('[data-cy=register-success]')
      .should('contain.text', 'Registration successful! You can now login.');
  });
});
