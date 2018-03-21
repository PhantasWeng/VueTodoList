<template lang="pug">
  #app
    el-container
      el-aside(width="200px")
        el-row.function-row
          el-col
            el-button(type="primary", icon="el-icon-circle-plus")
              span 新增 Todo
        el-menu(:default-openeds="['1', '2']", :collapse="false")
          el-submenu(index="1")
            template(slot="title")
              i.el-icon-menu
              span 類型
            el-menu-item-group
              //- template(slot="title") 類型
              el-menu-item(index="1-1")
                span 工作
                  small (12)
              el-menu-item(index="1-2")
                span 娛樂
                  small (2)
              el-menu-item(index="1-3")
                span 飲食
                  small (5)
              el-menu-item(index="1-3")
                span 閱讀
                  small (3)
          el-submenu(index="2")
            template(slot="title")
              i.el-icon-news
              span 狀態
            el-menu-item-group
              //- template(slot="title") 快速選擇
              el-menu-item.el-menu-item--with-badge(index="2-1")
                el-badge
                  el-button(size="mini") 未完成
              el-menu-item.el-menu-item--with-badge(index="2-1")
                el-badge(is-dot)
                  el-button(size="mini") 處理中
              el-menu-item.el-menu-item--with-badge(index="2-1")
                el-badge
                  el-button(size="mini") 已完成
              el-menu-item.el-menu-item--with-badge(index="2-1")
                el-badge
                  el-button(size="mini") 驗收中
              el-menu-item.el-menu-item--with-badge(index="2-1")
                el-badge(is-dot)
                  el-button(size="mini") 驗收完成
      el-container
        el-main
          //- router-view
          el-scrollbar
            .todo-wrap
              el-card.box-card(v-for="card in 18", :key="card")
                .box-card__header(slot="header")
                  el-row(type="flex", justify="space-between", style="margin-bottom: 8px;")
                    el-col
                      .box-card__title 卡片名稱
                    el-col(:span="6")
                      el-button-group(style="float: right;")
                        el-button(size="mini", plain)
                          i.el-icon-edit
                        el-button(size="mini", plain)
                          i.el-icon-delete
                  el-row(type="flex", justify="space-between")
                    el-col.box-card__tag
                      el-tag(size="mini", type="primary") 生活
                      el-tag(size="mini", type="success") 未完成
                      el-tag(size="mini", type="info") PhantasWeng
                .box-card__content
                  p.content
                    p 今日待辦
                    ul
                      li todo 內容
                      li todo 內容
                      li todo 內容
                      li todo 內容
</template>

<script>
import dateFns from 'date-fns'

export default {
  name: 'App',
  data () {
    return {
      currentDate: dateFns.format(new Date(), 'YYYY/MM/DD mm:ss')
    }
  },
  methods: {
    timeFormat (cardDate) {
      if (dateFns.isToday(cardDate) === true) {
        dateFns.format(cardDate, 'mm:ss')
      } else {
        dateFns.format(cardDate, 'YYYY/MM/DD mm:ss')
      }
    }
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
        margin-top: 8px
        height: 40px
        line-height: initial

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
  padding: 32px

//box-card
.box-card
  margin-bottom: 8px
  &__title
    font-size: 20px
    font-weight: bold


.el-tag + .el-tag
  margin-left: 4px

//clearFix
.clearfix:before, .clearfix:after
  display: table
  content: ""

.clearfix:after
  clear: both
</style>
