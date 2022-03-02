class roomheader {
	constructor(root) {
		// console.log("hd");
		this.root = root;
		this.$header = $(`<div class="room-header bor"></div>`);
		this.$room_name = $('<h2 class="room-header-roomname">在线聊天室</h2>');
		this.$header.append(this.$room_name);
		this.root.$room.append(this.$header);
	}
}

class message {
	constructor(root, username, time, message) {
		console.log("fromf " + root + ": create ->" + message);
		this.root = root;
		this.$message = $(`
		<div class="message">
		    <qqqq class="username">poker</qqqq>
		    <qqq class="time">(2020-02-02 16:59)</qqq>
		    ->
		    <qq class="_message">wish you wish you wish you</qq>
		</div>
		`);
		this.$message.find(".username").text(username);
		this.$message.find(".time").text(" ( " + time + " ) ");
		this.$message.find("._message").text(message);
		this.root.append(this.$message);
	}
}

class roombody {
	constructor(root) {
		this.root = root;
		console.log("body");
		this.$body = $(`<div class="room-body bor"></div>`);
		this.root.$room.append(this.$body);
		this.start();
	}
	
	start(){

	}

	create_new_message(data) {
		let outer = this;
		console.log(data);
		new message(outer.$body, data.username, data.time, data.message_content);
		var hh = outer.$body[0].scrollHeight;
		console.log(hh);
		// console.log(outer.$body.innerHeight() + "   " +outer.$body.outerHeight())
		outer.$body.scrollTop(hh);
	}
	
}

class roomfooter {
	constructor(root) {
		console.log("footer");
		this.root = root;
		this.$footer = $(`
		<div class="room-footer bor">
			<input type="text" class="roomfooter-message-input-box" placeholder="在此输入想发送的信息" name="message-inputer">
			<input type="button" value="发送" class="float-right roomfooter-message-submit-btn">
			<div class="status-bar">
				<a>当前共<b class="roomfooter-online-user-num">0</b>人在线</a>
				<div class="float-right">
					<input type="text" placeholder="在此输入你想使用的用户名" class="roomfooter-username-input-box">
					<input type="button" value="未锁定" class="roomfooter-username-lock-btn">
				</div>
			</div>
		</div>`);
		this.root.$room.append(this.$footer);
		this.$message_inputer = this.$footer.find(".roomfooter-message-input-box");
		this.$message_submit_btn = this.$footer.find(".roomfooter-message-submit-btn");
		this.$online_user_num = this.$footer.find(".roomfooter-online-user-num");
		this.$username_inputer = this.$footer.find(".roomfooter-username-input-box");
		this.$username_locker = this.$footer.find(".roomfooter-username-lock-btn");
		this.start();
	}

	start() {
		console.log('footer start..');
		this.add_event_listener();
	}

	add_event_listener() {
		let outer = this;
		this.$message_submit_btn.click(function() {
			outer.send_message();
		});
		this.$username_locker.click(function() {
			outer.lock_username();
		});
	}

	send_message() {
		let outer = this;
		var tt = new Date();
		var message_content = outer.$message_inputer.val(),
			time_now = tt.getFullYear() + "-" + (tt.getMonth() + 1) + "-" + tt.getDate() + " " + tt.getHours() +
			":" + tt.getMinutes() + ":" + tt.getSeconds(),
			username = outer.$username_inputer.val();
		outer.$message_inputer.val("");
		outer.root.$socket.send(JSON.stringify({
			action: 'message',
			time: time_now,
			message_content: message_content,
			username: username
		}))
	}

	lock_username() {
		// console.log("=============================");
		let outer = this;
		let ip = outer.$username_inputer,
			lk = outer.$username_locker;
		var stat = ip.attr("disabled");
		// console.log(stat);
		// console.log(typeof(stat) == "undefined");
		if (typeof(stat) === "undefined") {
			//未锁定
			ip.attr("disabled", "disabled");
			// console.log("[ ] : " + ip["disabled"]);
			// console.log("attr: " + ip.attr("disabled"));
			lk.val("已锁定");
		} else {
			//已锁定
			ip.removeAttr("disabled")
			lk.val("未锁定");
		}
		// console.log("=============================");
		// username_input_box.setAttribute("disabled", "disabled");
	}

	online_usernum_change(data) {
		let outer = this;
		console.log(data.user_num);
		outer.$online_user_num.text(data.user_num.toString());
	}
}
class chatroom {
	constructor(id) {
		console.log("welcome room " + id);
		this.$room = $("#" + id);
		this.$header = new roomheader(this);
		this.$body = new roombody(this);
		this.$footer = new roomfooter(this);
		this.$socket = new WebSocket("ws://127.0.0.1:6789/");

		this.start();
	}

	start() {
		let outer = this;
		outer.add_event_listener();
	}

	add_event_listener() {
		let outer = this;
		outer.$socket.onmessage = function(e) {
			let data = JSON.parse(e.data);
			console.log(data);
			// console.log(typeof(data));
			if (data.action === 'message') {
				outer.receive_new_message(data);
			} else if (data.action === 'user') {
				outer.online_user_num_change(data);
			}
		}
		$(window).keydown(function(e) {
			console.log(e.keyCode);
			switch (e.keyCode) {
				case 13:
					outer.$footer.$message_submit_btn.click();
					break;
			}
		});
	}

	receive_new_message(data) {
		console.log("receive_new_message");
		let outer = this;
		outer.$body.create_new_message(data);
	}

	online_user_num_change(data) {
		console.log("online_user_num_change");
		let outer = this;
		outer.$footer.online_usernum_change(data);
	}


}
