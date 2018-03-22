<template lang="pug">
  #app
    el-container
      el-aside(width="200px")
        el-row.function-row
          el-col
            el-button(type="primary", icon="el-icon-circle-plus", @click="addTodoButton")
              span 新增 Todo
        el-menu(:default-openeds="['1', '2']", :collapse="false")
          el-submenu(index="1")
            template(slot="title")
              i.el-icon-news
              span 狀態
            el-menu-item-group
              //- template(slot="title") 快速選擇
              el-menu-item.el-menu-item--with-badge(index="2-1")
                el-badge
                  el-button(size="mini", icon="el-icon-close") 未完成
              //- el-menu-item.el-menu-item--with-badge(index="2-1")
                el-badge(is-dot)
                  el-button(size="mini") 處理中
              el-menu-item.el-menu-item--with-badge(index="2-2")
                el-badge(is-dot)
                  el-button(size="mini", icon="el-icon-check") 完成
              //- el-menu-item.el-menu-item--with-badge(index="2-1")
                el-badge
                  el-button(size="mini") 驗收中
              //- el-menu-item.el-menu-item--with-badge(index="2-1")
                el-badge(is-dot)
                  el-button(size="mini") 驗收完成
          el-submenu(index="2")
            template(slot="title")
              i.el-icon-menu
              span 標籤
            el-menu-item-group
              //- template(slot="title") 類型
              el-menu-item(v-for="(tag, index) in dynamicTags", :key="index", index="1-1")
                span {{ tag }}
      el-container
        el-main
          //- router-view
          el-scrollbar
            //- <div id="editor">
            //-   <textarea :value="input" @input="update"></textarea>
            //-   <div v-html="compiledMarkdown"></div>
            //- </div>
            .todo-wrap
              .cards-wrap
                el-card.box-card(v-for="(card, index) in todoCards", :key="index")
                  .box-card__header(slot="header")
                    el-row(type="flex", justify="space-between", style="margin-bottom: 8px;")
                      el-col
                        .box-card__title {{ card.title }}
                      el-col(:span="12")
                        el-tooltip(v-if="card.status === true", effect="dark", content="已完成" placement="top-start")
                          .statusCheck-wrap(@click="card.status = !card.status")
                            .statusCheck(:class="{checked: card.status === true}")
                        el-tooltip(v-else, effect="light", content="未完成" placement="top-start")
                          .statusCheck-wrap(@click="card.status = !card.status")
                            .statusCheck(:class="{checked: card.status === true}")
                        //- pre {{card.status}}
                        el-button-group(style="float: right; margin-right: 8px;")
                          el-button(size="mini", plain, @click="editCard(index)")
                            i.el-icon-edit
                          el-button(size="mini", plain, @click="deleteCard(index)")
                            i.el-icon-delete
                    el-row(type="flex", justify="space-between")
                      el-col.box-card__tag
                        el-tag(v-for="(tag, index) in card.tags", :key="index", size="medium", :type="tag.type", closable, :disable-transitions="false", @close="handleClose(tag, card.tags)") {{ tag.text }}
                        el-input.input-new-tag(v-if="card.tagsInputVisible", v-model="inputValue", :ref="'saveTagInput' + index", size="mini", @keyup.enter.native="handleInputConfirm(card.tags, card)", @blur="handleInputConfirm(card.tags, card)")
                        el-button.button-new-tag(v-else, size="small" @click="showInput(card, index)") + New Tag
                  .box-card__content
                    .content(v-html="compiledMarkdown(card.content)")
          el-dialog(title='新增 Todo', :visible.sync='dialogFormVisible')
            el-form
              el-form-item(label='title')
                el-input(v-model='addTodoForm.title', auto-complete='off')
              el-form-item(label='content')
                el-input(type='textarea', :rows='4', v-model='addTodoForm.content')
                small Markdown 格式：
                 a(target="_blankh", href="https://wastemobile.gitbooks.io/gitbook-chinese/content/format/markdown.html") 編輯說明
            span.dialog-footer(slot='footer')
              el-button(@click='dialogFormVisible = false') 取消
              el-button(type='primary', @click='pushNewTodo') 建立
          el-dialog(title='編輯內容', :visible.sync='editFormVisible')
            el-form
              el-form-item(label='title')
                el-input(v-model='thisTodoForm.title', auto-complete='off')
              el-form-item(label='content')
                el-input(type='textarea', :rows='4', v-model='thisTodoForm.content')
                small Markdown 格式：
                 a(target="_blankh", href="https://wastemobile.gitbooks.io/gitbook-chinese/content/format/markdown.html") 編輯說明
            span.dialog-footer(slot='footer')
              el-button(@click='editFormVisible = false') 取消
              el-button(type='primary', @click='updateTodo(thisTodoForm.index)') 更新
</template>

<script>
import dateFns from 'date-fns'
import _ from 'lodash'
import marked from 'marked'

export default {
  name: 'App',
  data () {
    return {
      input: '# hello',
      test: '',
      testArray: [],
      currentDate: dateFns.format(new Date(), 'YYYY/MM/DD mm:ss'),
      dynamicTags: ['Tag 1', 'Tag 2', 'Tag 3'],
      inputVisible: false,
      inputValue: '',
      status: '',
      dialogFormVisible: false,
      editFormVisible: false,
      thisTodoForm: {
        index: '',
        title: '',
        content: ''
      },
      addTodoForm: {
        title: '',
        content: ''
      },
      todoCards: [
        {
          title: '如何新增新的Todo',
          content: '### 點選左上方 \n - 新增按鈕藍色 \n - 填寫標題 \n 填寫內容',
          status: false,
          tagsInputVisible: false,
          tags: [
            {
              text: '生活',
              type: 'success'
            },
            {
              text: 'Vue相關',
              type: 'warning'
            },
            {
              text: 'Dcard',
              type: 'primary'
            }
          ]
        },
        {
          title: '我是 Phantas',
          content: '我用 Vue  \n Vue *是很有趣的* framework  \n 設計師都能學會',
          status: true,
          tagsInputVisible: false,
          tags: [
            {
              text: 'Phantas',
              type: 'primary'
            },
            {
              text: 'Weng',
              type: 'primary'
            },
            {
              text: 'UIUX',
              type: 'info'
            },
            {
              text: 'F2E',
              type: 'info'
            }
          ]
        },
        {
          title: '很高興',
          content: '能夠認識您',
          status: true,
          tagsInputVisible: false,
          tags: [
            {
              text: '咦',
              type: 'success'
            },
            {
              text: 'Danger',
              type: 'danger'
            },
            {
              text: 'Primary',
              type: 'primary'
            }
          ]
        }
      ]
    }
  },
  methods: {
    addTodoButton () {
      this.dialogFormVisible = true
    },
    updateTodo (index) {
      let todo = this.todoCards[index]
      todo.title = this.thisTodoForm.title
      todo.content = this.thisTodoForm.content
      this.editFormVisible = false
      const h = this.$createElement
      this.$notify({
        title: '更新卡片',
        message: h('i', { style: 'color: #409EFF' }, todo.title + ' - 已更新'),
        type: 'success'
      })
    },
    pushNewTodo () {
      if (this.addTodoForm.title !== '') {
        this.dialogFormVisible = false
        this.todoCards.push({
          title: this.addTodoForm.title,
          content: this.addTodoForm.content
        })
        // console.log(this.todoCards)
        const h = this.$createElement
        this.$notify({
          title: '新增卡片',
          message: h('i', { style: 'color: #409EFF' }, this.addTodoForm.title + ' - 已新增'),
          type: 'success'
        })
        this.addTodoForm.title = ''
        this.addTodoForm.content = ''
      } else {
        this.$message({
          message: '標題為必填欄位',
          type: 'error'
        })
      }
    },
    deleteCard (index) {
      // console.log(index)
      this.todoCards.splice(index, 1)
    },
    editCard (index) {
      let todo = this.todoCards[index]
      this.editFormVisible = true
      this.thisTodoForm.index = index
      this.thisTodoForm.title = todo.title
      this.thisTodoForm.content = todo.content
    },
    timeFormat (cardDate) {
      if (dateFns.isToday(cardDate) === true) {
        dateFns.format(cardDate, 'mm:ss')
      } else {
        dateFns.format(cardDate, 'YYYY/MM/DD mm:ss')
      }
    },
    handleClose (tag, tags) {
      tags.splice(tags.indexOf(tag), 1)
    },

    showInput (card, index) {
      card.tagsInputVisible = true
      this.$nextTick(_ => {
        // console.log(this.$refs['saveTagInput' + index][0].$refs)
        this.$refs['saveTagInput' + index][0].$refs.input.focus()
      })
    },
    handleInputConfirm (tags, card) {
      // console.log(card)
      let inputValue = this.inputValue
      if (inputValue) {
        tags.push({
          text: inputValue,
          type: 'info'
        })
      }
      card.tagsInputVisible = false
      this.inputValue = ''
    },
    update: _.debounce(function (e) {
      this.input = e.target.value
    }, 300),
    compiledMarkdown: function (content) {
      return marked(content, { sanitize: true })
    }
  },
  computed: {
  }
}
</script>

<style lang="sass">
// @import '~stylesheets/_bootstrap-variables.scss'
// @import '~bootstrap/scss/bootstrap.scss'
@import 'normalize.css/normalize.css'

body
  overflow: hidden
#app
  .el-aside
  .el-menu
    border: none
    // background-color: transparent
  .el-submenu
    .el-menu-item
      &.el-menu-item--with-badge
        padding-top: 12px
        height: 50px
        line-height: initial
        &:hover
          background-color: transparent

.tag-row
  background-color: #fff
  // padding: 16px 0

.el-main
  // background-color: #d1d8e0
  height: 100%
  padding: 0

.function-row
  padding: 8px

.todo-wrap
  height: 100vh
  .cards-wrap
    padding: 32px

//box-card
.box-card
  margin-bottom: 8px
  &__title
    font-size: 20px
    font-weight: bold

.statusCheck-wrap
  cursor: pointer
  float: right
  padding: 8px
  .statusCheck
    border: 1px solid #c0c4cc
    width: 10px
    height: 10px
    border-radius: 999px
    background-color: #F2F6FC
    transition: all 0.3s ease
    &:hover
      border-color: #67C23A
    &.checked
      background-color: #67C23A
      border-color: #67C23A

.el-tag + .el-tag
  margin-left: 4px

.button-new-tag
  margin-left: 8px
  height: 32px
  line-height: 30px
  padding-top: 0
  padding-bottom: 0
.input-new-tag
  width: 90px
  margin-left: 10px
  vertical-align: bottom

//clearFix
.clearfix:before, .clearfix:after
  display: table
  content: ""

.clearfix:after
  clear: both
</style>
