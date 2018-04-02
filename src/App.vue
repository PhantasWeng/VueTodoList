<template lang="pug">
  #app
    el-container
      el-aside(:class="{'menuOn': menuSwitch }")
        el-row.function-row
          el-col
            el-button(type="primary", icon="el-icon-circle-plus", @click="addTodoButton", style="width: 100%;")
              span 新增 Todo
        el-row
          el-col
            .user-card
              .img-avatar-wrap
                .img-avatar
                  img(v-if="user.avatar", :src="user.avatar")
                  img(v-else, src="https://api.fnkr.net/testimg/300x300/ddd/FFF/?text=AVATAR")
                  .edit-avatar(@click="updatePicture")
                    i.el-icon.el-icon-picture-outline
                    span 更新圖片
              .userName {{ user.name }}
        el-menu(:default-openeds="['1']", :collapse="false")
          el-submenu(index="1")
            template(slot="title")
              i.el-icon-menu
              span 標籤
            el-menu-item-group
              el-menu-item(@click="tagsFiltering('')", :index="'1-0'")
                span 全部
              el-menu-item(v-for="(tag, index) in dynamicTags", :key="index", :index="'1-' + String(index + 1)", @click="tagsFiltering(tag)")
                span {{ tag }}
      el-container
        el-header
          el-row.fn-button-row
            el-col(:span="4")
              el-tooltip(effect="dark", content="清除已完成" placement="top-start")
                el-button(type="danger", icon="el-icon-delete", @click="clearTodo")
            el-col(:span="20")
              div(style="float: right;")
                el-radio-group(v-model="statusFilter")
                  el-radio-button(label="") All
                  el-radio-button(label="false")
                    i.el-icon-close
                  el-radio-button(label="true")
                    i.el-icon-check
                .menu-btn
                  el-button.hidden-sm-and-up(v-if="menuSwitch === true", icon="el-icon-close", @click="menuSwitch = !menuSwitch") 選單
                  el-button.hidden-sm-and-up(v-else, icon="el-icon-menu", @click="menuSwitch = !menuSwitch") 選單
        el-main
          //- router-view
          el-scrollbar
            .todo-wrap
              .cards-wrap
                el-card.box-card(v-if="tagsCondition(card)", v-for="(card, index) in todoCards", :key="index")
                  .box-card__header(slot="header")
                    el-row(style="margin-bottom: 8px;")
                      el-col(:span="18", :xs="{span: 24}")
                        .box-card__title {{ card.title }}
                      el-col(:span="6", :xs="{span: 24}")
                        el-tooltip(v-if="card.status === true", effect="dark", content="已完成" placement="top-start")
                          .statusCheck-wrap(@click="card.status = !card.status")
                            .statusCheck(:class="{checked: card.status === true}")
                        el-tooltip(v-else, effect="light", content="未完成" placement="top-start")
                          .statusCheck-wrap(@click="card.status = !card.status")
                            .statusCheck(:class="{checked: card.status === true}")
                        el-button-group(style="float: right; margin-right: 8px;")
                          el-button(size="mini", plain, @click="editCard(index)")
                            i.el-icon-edit
                          el-button(size="mini", plain, @click="deleteCard(index)")
                            i.el-icon-delete
                    el-row(type="flex", justify="space-between")
                      el-col.box-card__tag
                        el-tag(v-for="(tag, index) in card.tags", :key="index", size="medium", :type="tag.type", closable, :disable-transitions="false", @close="handleClose(tag, card.tags)") {{ tag.text }}
                        el-input.input-new-tag(v-show="card.tagsInputVisible", v-model="inputValue", :ref="'saveTagInput' + index", size="mini", @keyup.enter.native="handleInputConfirm(card.tags, card)", @blur="handleInputConfirm(card.tags, card)")
                        el-button.button-new-tag(v-show="!card.tagsInputVisible", size="small", icon="el-icon-plus", @click="showInput(card, index)") {{index}}
                  .box-card__content
                    .content(v-html="compiledMarkdown(card.content)")
          el-dialog(title='新增 Todo', :center="true", :fullscreen="true", :visible.sync='dialogFormVisible')
            el-form
              el-form-item(label='標題')
                el-input(v-model='addTodoForm.title', auto-complete='off')
              el-form-item(label='內容')
                el-input(type='textarea', :rows='4', v-model='addTodoForm.content')
                small Markdown 格式：
                 a(target="_blankh", href="https://wastemobile.gitbooks.io/gitbook-chinese/content/format/markdown.html") 編輯說明
            span.dialog-footer(slot='footer')
              el-button(@click='dialogFormVisible = false') 取消
              el-button#pushNewTodo(type='primary', @click='pushNewTodo') 建立
          el-dialog(title='編輯 Todo', :center="true", :fullscreen="true", :visible.sync='editFormVisible')
            el-form
              el-form-item(label='標題')
                el-input(v-model='thisTodoForm.title', auto-complete='off')
              el-form-item(label='內容')
                el-input(type='textarea', :rows='4', v-model='thisTodoForm.content')
                small Markdown 格式：
                 a(target="_blankh", href="https://wastemobile.gitbooks.io/gitbook-chinese/content/format/markdown.html") 編輯說明
            span.dialog-footer(slot='footer')
              el-button(@click='editFormVisible = false') 取消
              el-button(type='primary', @click='updateTodo(thisTodoForm.index)') 更新
          el-dialog(title='使用者設定', :center="true", :fullscreen="true", :visible.sync='dialogUploadVisible', ref="avatarUpdate")
            .cards-wrap
              el-row
                el-col(:span="24")
                  el-form
                    el-form-item(label="姓名")
                      el-input(type='text', v-model='user.name')
                    form(enctype="multipart/form-data")
                      el-form-item(label="圖片網址")
                        el-input(placeholder="輸入網址", @change="urlGetFile($event)")
                          template(slot="prepend") Http://
                      el-form-item(label="從本機上傳")
                        label(for="fileUploadBtn")
                          .fileUploadBtn
                            i.el-icon.el-icon-upload
                            span 選擇檔案
                        input#fileUploadBtn(type="file", @change="fileUploadChange($event)")
                  .selectFrame
                    img.frameSelect(v-for="(option, index) in frameOptions", :src='option', @click="selectedFrame(option)", :class="{selected: option === selectedFrameUrl}")
                    //- img.frameSelect(src='http://www.pngmart.com/files/5/Square-Frame-PNG-Photos.png', @click="selectedFrame($event)")
                    //- img.frameSelect(src='https://www.freeiconspng.com/uploads/square-picture-frame-png-4.png', @click="selectedFrame($event)")
                  #cropperWrap
                    img#cropperTarget(:src="base64Img", style="max-width: 100%; height: auto;")
                  #resultDom
              span.dialog-footer(slot='footer')
                el-button(type="primary", style="margin-top: 16px;", @click="getCroppedCanvas()") 更新資訊

</template>

<script>
import dateFns from 'date-fns'
import _ from 'lodash'
import marked from 'marked'
import Cropper from 'cropperjs'

export default {
  name: 'App',
  data () {
    return {
      input: '',
      user: {
        avatar: '',
        name: 'Phantas Weng'
      },
      selectedFrameUrl: '',
      frameOptions: [
        'https://i.imgur.com/Ta4AY9i.png',
        'https://i.imgur.com/vUmQSgM.png'
      ],
      upLoadimageUrl: '',
      base64Img: '',
      test: '',
      testArray: [],
      currentDate: dateFns.format(new Date(), 'YYYY/MM/DD mm:ss'),
      dynamicTags: [],
      inputVisible: false,
      inputValue: '',
      status: '',
      menuSwitch: '',
      dialogFormVisible: false,
      editFormVisible: false,
      dialogUploadVisible: false,
      thisTodoForm: {
        index: '',
        title: '',
        content: ''
      },
      tagsFilter: '',
      statusFilter: '',
      addTodoForm: {
        title: '',
        content: ''
      },
      todoCards: [
        {
          title: '如何新增新的Todo',
          content: '### 點選左上方 \n - 新增按鈕藍色 \n - 填寫標題 \n 填寫內容',
          status: false,
          visible: true,
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
          visible: true,
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
          visible: true,
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
        },
        {
          title: '很高興2',
          content: '能夠認識您',
          status: false,
          visible: true,
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
    fileUploadChange ($event) {
      let file = $event.target.files[0]
      console.log('fileList:', file)
      this.loadImgFile(file)
    },
    selectedFrame (optionUrl) {
      this.selectedFrameUrl = optionUrl
    },
    addSticker (stickerUrl) {
      var resultCanvas = document.getElementById('resultCanvas')
      var sticker = new Image()
      var that = this
      let w = resultCanvas.width
      let h = resultCanvas.height
      sticker.setAttribute('crossOrigin', 'anonymous')
      sticker.src = stickerUrl
      sticker.onload = function () {
        var ctx = resultCanvas.getContext('2d')
        ctx.drawImage(sticker, 0, 0, w, h)
        that.user.avatar = document.getElementById('resultCanvas').toDataURL('image/jpeg')
      }
    },
    getCroppedCanvas () {
      var resultDom = document.getElementById('resultDom')
      var result = this.cropper.getCroppedCanvas()
      if (result) {
        result.setAttribute('id', 'resultCanvas')
        if (document.getElementById('resultCanvas')) {
          var resultCanvas = document.getElementById('resultCanvas')
          resultDom.replaceChild(result, resultCanvas)
        } else {
          resultDom.appendChild(result)
        }
        if (this.selectedFrameUrl !== '') {
          this.addSticker(this.selectedFrameUrl)
        } else {
          this.user.avatar = document.getElementById('resultCanvas').toDataURL('image/jpeg')
        }
        this.dialogUploadVisible = false
        this.cropper.reset()
        this.$message({
          type: 'success',
          message: '個人資料更新成功'
        })
      } else {
        this.$message({
          type: 'error',
          message: '請先選擇圖片'
        })
      }
    },
    consoleLog (target) {
      console.log(target)
    },
    urlGetFile ($event) {
      // https://randomuser.me/api/portraits/women/1.jpg
      // console.log('imageUrl:', $event.target.value)
      var image = new Image()
      var canvas = document.createElement('canvas')
      var context = canvas.getContext('2d')

      canvas.setAttribute('id', 'testCanvas')
      image.setAttribute('crossOrigin', 'Anonymous')
      image.src = 'http://' + $event.replace(/(^\w+:|^)\/\//, '')
      // image.src = $event.target.value
      image.onload = () => {
        canvas.width = image.width
        canvas.height = image.height
        context.drawImage(image, 0, 0)
        // document.getElementById('cropperWrap').appendChild(canvas)
        document.getElementById('cropperWrap').appendChild(canvas)
        this.base64Img = canvas.toDataURL('image/jpeg')
      }
      image.onerror = function () {
        // alert('CORS 被阻擋')
        image.src = 'https://api.fnkr.net/testimg/300x300/ddd/888/?text=ERROR'
      }
    },
    loadImgFile (file) {
      var reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        this.base64Img = reader.result
        // console.log(reader.result)
      }
    },
    updateCropper () {
      this.cropper.replace(this.base64Img)
      console.log('Cropper update:', this.cropper)
    },
    initCropper () {
      if (document.getElementById('cropperWrap') != null) {
        // cropperJs
        var image = document.getElementById('cropperTarget')
        console.log('image', image)
        this.cropper = new Cropper(image, {
          aspectRatio: 1,
          // minCropBoxWidth: 300,
          viewMode: 2,
          // dragMode: 'move',
          // cropBoxMovable: false,
          background: false,
          zoomable: true,
          crop: function (event) {
            console.log('cropEvent:', event)
          }
        })
        console.log('Cropper init:', this.cropper)
      }
    },
    updatePicture () {
      // alert('updatePicture')
      this.dialogUploadVisible = true
      this.$nextTick(function () {
        if (!this.cropper) {
          this.initCropper()
        }
      })
    },
    addTodoButton () {
      this.dialogFormVisible = true
    },
    clearTodo () {
      this.$confirm('確定清除所有已完成 Todo ?', '刪除？', {
        confirmButtonText: '刪除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let newTodoList = []
        for (let card of this.todoCards) {
          if (card.status === false) {
            // let index = this.todoCards.indexOf(card)
            // console.log(index)
            newTodoList.push(card)
            // console.log(newTodoList)
          }
        }
        this.todoCards = newTodoList
        this.$message({
          type: 'success',
          message: '刪除完成'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消刪除'
        })
      })
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
          content: this.addTodoForm.content,
          status: false,
          visible: true,
          tagsInputVisible: false,
          tags: []
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
      let tagsArray = []
      for (let card of this.todoCards) {
        for (let tag of card.tags) {
          // console.log(tag.text)
          tagsArray.push(tag.text)
        }
      }
      this.dynamicTags = _.uniq(tagsArray)
    },

    showInput (card, index) {
      // console.log(card, index)
      card.tagsInputVisible = true
      this.$nextTick(() => {
        // console.log(this.$refs['saveTagInput' + index][0].$refs.input)
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
      let tagsArray = []
      for (let card of this.todoCards) {
        for (let tag of card.tags) {
          // console.log(tag.text)
          tagsArray.push(tag.text)
        }
      }
      this.dynamicTags = _.uniq(tagsArray)
      card.tagsInputVisible = false
      this.inputValue = ''
    },
    update: _.debounce(function (e) {
      this.input = e.target.value
    }, 300),
    compiledMarkdown: function (content) {
      return marked(content, { sanitize: true })
    },
    tagsFiltering (tag) {
      this.tagsFilter = tag
    },
    tagsCondition (card) {
      if (String(card.status) === this.statusFilter || this.statusFilter === '') {
        if (this.tagsFilter !== '') {
          if (_.findKey(card.tags, ['text', this.tagsFilter]) > -1) {
            return true
          }
          return false
        } else if (this.tagsFilter === '') {
          return true
        }
      }
    }
  },
  computed: {
  },
  mounted () {
    let tagsArray = []
    for (let card of this.todoCards) {
      for (let tag of card.tags) {
        // console.log(tag.text)
        tagsArray.push(tag.text)
      }
    }
    this.dynamicTags = _.uniq(tagsArray)
    // this.$nextTick(function () {
    //   this.initCropper()
    // })
  },
  watch: {
    statusFilter: function () {
      // console.log(this.statusFilter)
    },
    todoCards: function () {
      console.log('變動')
    },
    base64Img: function () {
      console.log('base64Updated')
      this.updateCropper()
    }
  },
  updated () {
    // this.initCropper()
  }
}
</script>

<style lang="sass">
// @import '~stylesheets/_bootstrap-variables.scss'
// @import '~bootstrap/scss/bootstrap.scss'
@import 'normalize.css/normalize.css'
@import 'element-ui/lib/theme-chalk/display.css'
@import 'cropperjs/dist/cropper.css'

body
  overflow: hidden
#app
  .el-aside
    position: relative
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1)
    // background-color: #F2F6FC
    width: 200px !important
    @media screen and (max-width: 1000px)
      width: 0px !important
      &.menuOn
        position: fixed
        width: 200px !important
        height: 100vh
        z-index: 999
        background-color: #fff
  .el-menu
    // background-color: #F2F6FC
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

  .el-header
    // background-color: #C0C4CC
    border-bottom: 1px solid #C0C4CC
  .el-main
    background-color: #F2F6FC
    padding: 0 8px
  .fn-button-row
    padding: 8px 16px

.tag-row
  background-color: #fff
  // padding: 16px 0

.el-main
  // background-color: #d1d8e0
  height: 100%
  padding: 0

.function-row
  padding: 8px

.el-scrollbar__view
  // height: 100vh

.todo-wrap
  height: calc(100vh - 60px)
  .cards-wrap
    padding: 32px

//box-card
.box-card
  margin-bottom: 8px
  &__title
    font-size: 20px
    font-weight: bold
    margin-bottom: 8px

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

.menu-btn
  display: inline-block
  margin-left: 8px

.box-card__tag
  // margin-top: 8px

#testCanvas
  display: none

#cropperWrap
  width: 300px
  height: 300px
  border: 1px solid #ddd
  margin: 8px

.fileUploadBtn
  background-color: #409EFF
  color: #fff
  display: inline-block
  padding: 4px 16px
  border-radius: 6px
  cursor: pointer
  font-size: 16px
  .el-icon
    font-size: 20px
    margin-right: 8px
  &:hover
    background-color: rgba(#409EFF, 0.8)

#fileUploadBtn
  visibility: hidden

.user-card
  border-bottom: 1px solid #ddd
  padding-bottom: 16px
  margin-bottom: 16px
  .img-avatar-wrap
    padding: 16px 16px 0 16px
  .img-avatar
    position: relative
    border-radius: 8px
    overflow: hidden
    position: relative
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.3)
    img
      width: 100%
      display: block
    .edit-avatar
      position: absolute
      bottom: 0
      width: 100%
      text-align: center
      background-color: rgba(black, .3)
      color: #fff
      cursor: pointer
      padding: 8px 0
      i.el-icon
        margin-right: 8px
  .userName
    font-weight: bold
    text-align: center
    font-size: 18px
    padding: 14px 14px 8px 14px
    color: #888

#resultDom
  display: none

#resultDom, #resultCanvas
  width: 200px
  height: 200px

.frameSelect
  width: 100px
  height: 100px
  margin-right: 16px
  opacity: 0.5
  transition: all .3s ease
  &:hover
    opacity: 1
  &.selected
    opacity: 1
</style>
