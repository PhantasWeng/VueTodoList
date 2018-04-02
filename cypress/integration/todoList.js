describe('TodoList', function () {
  it('確認網頁標題為 todo-list', function () {
    cy.visit('http://localhost:8080')

    cy.title().should('eq', 'todo-list')
  })
  context('卡片', function () {
    beforeEach(function () {
      cy.visit('http://localhost:8080')
    })
    it('清除已完成卡片', function () {
      cy.get('.el-button > .el-icon-delete').click().wait(300)
        .get('.el-message-box__btns > .el-button--primary').click()
    })
    it('新增卡片', function () {
      cy.get('.function-row > .el-col > .el-button').click().wait(300)
        .get('.el-form-item__content > .el-input > .el-input__inner')
        .type('測試卡片')
        .wait(500)
        .get('.el-textarea__inner')
        .type('#測試卡片的內容')
        .get('#pushNewTodo').click()
    })
  })
})