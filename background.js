
function start() {
  if (!this.document) return;

  // 秒杀间隔
  let intervalTime = 50
  chrome.storage.local.get('intervalTime', val => {
    intervalTime = val.intervalTime || 50
  })

  // 抢购时间
  let buyTime = '2021-01-20T20:00'
  chrome.storage.local.get('buyTime', val => {
    buyTime = val.buyTime || '2021-01-20T20:00'
  })

  // 定时器
  let timer = undefined
  let settleTimer = undefined
  let submitTimer = undefined
  let cartTimer = undefined
  let buyTimer = undefined
  // 结算状态
  let settleStatus = false
  // 提交状态
  let submitStatus = false
  // 添加购物车状态
  let cartStatus = false

  function dateFormat(fmt, date) {
    let ret
    const opt = {
      "Y+": date.getFullYear().toString(),        // 年
      "m+": (date.getMonth() + 1).toString(),     // 月
      "d+": date.getDate().toString(),            // 日
      "H+": date.getHours().toString(),           // 时
      "M+": date.getMinutes().toString(),         // 分
      "S+": date.getSeconds().toString()          // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
    }
    for (let k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt)
      if (ret) {
        fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
      }
    }
    return fmt
  }

  /**
   * 结算
   */
  let settleFun = () => {
    settleStatus = true

    settleTimer = setInterval(() => {
      let go_button = document.querySelector('.common-submit-btn')
      if (go_button) {
        console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 开始抢购`)
        clearInterval(settleTimer)
        go_button.click()
      } else {
        console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 购物车中未选择商品 无法抢购`)
      }
    }, 10)
  }

  /**
   * 提交
   */
  let submitFun = () => {
    submitStatus = true

    let submitTimer = setInterval(() => {
      let submit_button = document.querySelector("#order-submit")
      if (submit_button) {
        console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:nmMM:SS', new Date())} 开始结算`)
        clearInterval(submitTimer)
        submit_button.click()
      } else {
        console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 很遗憾没抢到`)
        clearInterval(submitTimer)
      }
    }, 10)
  }

  // 加入购物车
  let addToCart = () => {
    cartStatus = true

    document.getElementById('InitCartUrl').click()
  }

  /**
   * 主入口
   */
  let main = () => {
    let startTime = new Date(buyTime).getTime()
    let nowTime = new Date().getTime()
    if (nowTime >= startTime) {
      let href = window.location.href

      if (href.indexOf('item.') !== -1) {
        if (cartStatus === false) {
          console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 准备添加购物车`)
          addToCart()
        }
      }
      // 判断当前所在页面
      else if (href.indexOf('cart.jd.com/addToCart') !== -1) {
        if (document.querySelector('.btn-addtocart')) {
          document.querySelector('.btn-addtocart').click()
          console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 跳转到购物车页面...`)
          return
        }

      }
      else if (href.indexOf('cart.jd.com/cart') !== -1) {
        // 购物车
        if (settleStatus === false) {
          console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 准备抢购`)

          settleFun()
        }
      }
      else if (href.indexOf('trade') !== -1) {
        // 结算
        if (submitStatus === false) {
          console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 准备结算`)
          submitFun()
        }
      }
    } else {
      console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 抢购时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date(buyTime))} 还没到时间`)
    }
  }

  /**
   * 运行
   */
  let run = () => {
    timer = setInterval(() => {
      main()
    }, intervalTime)
  }

  function $append($cont, htmlString) {
    let el = document.createElement('div')

    el.innerHTML = htmlString

    $cont.appendChild(el)
  }

  $append(document.body,
    `<div id="helper-setting-button">
    <div>抢购设置</div>
    </div>
    <div id="helper-setting-msg">
      <div></div>
    </div>
    `)

  document.querySelector('#helper-setting-button').onclick = () => {
    $append(document.body,
      `<div id="helper-setting">
        <div class="helper-setting-form">
          <div class="helper-setting-form-title">抢购设置</div>
          <div class="helper-setting-form-item">
            <label>秒杀间隔：</label>
            <input id="helper-setting-interval" class="helper-setting-form-item-interval" value="${intervalTime}"/>
            <label>（单位：毫秒）</label>
          </div>
          <div class="helper-setting-form-item">
            <label>抢购时间：</label>
            <input id="helper-setting-time" type="datetime-local" value="${buyTime}"/>
          </div>
          <div class="helper-setting-form-item">
            <div id="helper-setting-save-button" class="helper-setting-form-item-button">保存</div>
            <div id="helper-setting-cancel-button" class="helper-setting-form-item-button">取消</div>
            <div id="helper-setting-stop-button" class="helper-setting-form-item-button">停止</div>
          </div>
        </div>
      </div>`
    )

    // 保存按钮
    document.querySelector('#helper-setting-save-button').click(() => {
      clearInterval(timer)
      clearInterval(settleTimer)
      clearInterval(submitTimer)
      clearInterval(cartTimer)
      intervalTime = document.querySelector('#helper-setting-interval').value
      chrome.storage.local.set({ 'intervalTime': intervalTime })
      buyTime = document.querySelector('#helper-setting-time').val()
      chrome.storage.local.set({ 'buyTime': buyTime })

      document.body.removeChild(document.querySelector('#helper-setting'))

      run()
    })

    document.querySelector('#helper-setting-stop-button').onclick = () => {
      clearInterval(timer)
      clearInterval(settleTimer)
      clearInterval(submitTimer)
      clearInterval(cartTimer)

      document.querySelector('#helper-setting').remove()
    }

    // 取消按钮
    document.querySelector('#helper-setting-cancel-button').onclick = () => {
      document.querySelector('#helper-setting').remove()
    }
  }

  run()
}

start();

chrome.action && chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.includes("chrome://")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: start
    });
  }
});
