// cypress/e2e/studentExamRegistration.cy.js

describe('Student Exam Registration Flow', () => {
  it('should allow a student to register for an exam successfully', () => {
    // Step 1: Visit login page
    cy.visit('http://localhost:3000'); // adjust if needed
    cy.wait(2000); // wait 2s

    // Step 2: Enter Email
    cy.get('[data-cy=login-email]', { timeout: 2000 }).type('Student 1');

    // Step 3: Enter Password
    cy.get('[data-cy=register-password]', { timeout: 2000 }).type('123456');

    // Step 4: Click Login Button
    cy.get('[data-cy=register-submit]', { timeout: 2000 }).click();
    cy.wait(2000);

    // Step 5: Navigate to Exams tab
    cy.get('[data-cy=nav-exams]', { timeout: 2000 }).click();
    cy.wait(2000);

    // Step 6: Click Register button for an exam
    cy.get('[data-cy=exam-register-button]', { timeout: 2000 }).click();
    cy.wait(2000);

    // Step 7: Enter Exam Code in modal
    cy.get('[data-cy=exam-code-input]', { timeout: 2000 }).type('JID17TCC');

    // Step 8: Submit Registration
    cy.get('[data-cy=exam-submit]', { timeout: 2000 }).click();

    // Step 9 & 10: Verify Confirmation message
    cy.get('[data-cy=exam-register-success]', { timeout: 2000 })
      .should('contain.text', 'You have successfully registered for the exam!');
  });
});
