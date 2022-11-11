//import "./css/tools.css";
import { useEffect, useState } from "react";
import useCanvasContext from "../hooks/useCanvasContext";

const images_route = require.context("../assets", true);

function HistoryBar() {
  const app_ctx = useCanvasContext();
  var [image_upload_completed, setLoaded] = useState(true);

  function set_id(e) {
    localStorage.setItem("selected", e.target.src);
  }
  function cargar() {
    //load();
    const canvas = document.getElementById(app_ctx.ID_CANVAS);
    var ctx = canvas.getContext("2d");
    var img = new Image();
    /* img.src = localStorage.getItem("selected");
    img.onload = function () {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }; */

    /* img.src = canvas.toDataURL("image/png");
    console.log(img);
    ctx.drawImage(img, 100, 100, canvas.width, canvas.height); 
    img.onload = function () {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }; */
  }
  function quitar() {
    const canvas_backing = document.getElementById(app_ctx.ID_CANVAS_AUX);
    var ctx2 = canvas_backing.getContext("2d");
    setTimeout(function () {
      var img_previous = ctx2.getImageData(
        0,
        0,
        canvas_backing.width,
        canvas_backing.height
      );
      const canvas = document.getElementById(app_ctx.ID_CANVAS);
      var ctx = canvas.getContext("2d");
      ctx.putImageData(img_previous, 0, 0);
    }, 1000);
  }

  useEffect(() => {
    if (image_upload_completed) {
      refresh();
    }
    setLoaded(false);
  }, [image_upload_completed]);

  useEffect(() => {
    if (app_ctx.EVENT_SAVE) {
      openDb();
      add_item(app_ctx.IMAGES[app_ctx.IMAGES.length - 1]);
      app_ctx.EVENT_SAVE.setValue(false);
    }
  }, [app_ctx.EVENT_SAVE.save]);

  function refresh() {
    get_all_img();
    var images_array = app_ctx.IMAGES;
    if (images_array) {
      app_ctx.IMAGES = [];
      images_array.map((data) => {
        app_ctx.IMAGES.push(data);
      });
      var element = document.getElementById("lienzos_history");
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      app_ctx.IMAGES.map((img_elem) => {
        var new_image = new Image();
        new_image.src = img_elem.data;
        new_image.className = "w3-card w3-col s6";
        new_image.onClick = { set_id };
        element.appendChild(new_image);
      });
    }
  }

  const DB_NAME = "prueba",
    DB_STORE_NAME = "images";

  var [db, setDB] = useState(null);

  function openDb() {
    var request = indexedDB.open(DB_NAME, 2);
    request.onerror = function (event) {};
    request.onsuccess = function (event) {
      setDB(this.result);
    };
    request.onupgradeneeded = function (event) {
      var db = event.target.result;
      var objectStore = db.createObjectStore(DB_STORE_NAME, { keyPath: "id" });
      //objectStore.createIndex("images_name", "name", { unique: false });
      objectStore.transaction.oncomplete = function (event) {
        var customerObjectStore = db
          .transaction(DB_STORE_NAME, "readwrite")
          .objectStore(DB_STORE_NAME);
        for (var i in app_ctx.IMAGES) {
          customerObjectStore.add(app_ctx.IMAGES[i]);
        }
      };
    };
  }

  function add_item(data_in) {
    var objectStore = getObjectStore(DB_STORE_NAME, "readwrite");
    if (objectStore) {
      objectStore.transaction.oncomplete = function (event) {
        var customerObjectStore = db
          .transaction(DB_STORE_NAME, "readwrite")
          .objectStore(DB_STORE_NAME);
        customerObjectStore.add(data_in);
        customerObjectStore.onerror = function (event) {
        };
        customerObjectStore.onsuccess = function (event) {
        };
      };
    }
  }
  function getObjectStore(store_name, mode) {
    if (db) {
      var tx = db.transaction(store_name, mode);
      return tx.objectStore(store_name);
    } else {
      return null;
    }
  }

  function update_item(id) {
    var objectStore = getObjectStore(DB_STORE_NAME, "readwrite");
    if (objectStore) {
      objectStore.transaction.oncomplete = function (event) {
        var update_item = db
          .transaction([DB_STORE_NAME], "readwrite")
          .objectStore(DB_STORE_NAME)
          .get(id);
        update_item.onerror = function (event) {};
        update_item.onsuccess = function (event) {
          var data = update_item.result;
          data.name = "cambiando nombre";
          var requestUpdate = objectStore.put(data);
          requestUpdate.onerror = function (event) {};
          requestUpdate.onsuccess = function (event) {};
        };
      };
    }
  }

  function remove(id) {
    var objectStore = getObjectStore(DB_STORE_NAME, "readwrite");
    objectStore.transaction.oncomplete = function (event) {
      var update_item = db
        .transaction([DB_STORE_NAME], "readwrite")
        .objectStore(DB_STORE_NAME)
        .delete(id);
      update_item.onerror = function (event) {};
      update_item.onsuccess = function (event) {};
    };
  }

  function get_all_img() {
    var objectStore = getObjectStore(DB_STORE_NAME, "readwrite");

    if (objectStore) {
      objectStore.transaction.oncomplete = function (event) {
        var request = db
          .transaction([DB_STORE_NAME], "readwrite")
          .objectStore(DB_STORE_NAME)
          .getAll();
        request.onerror = function (event) {};
        request.onsuccess = function (event) {
          request.result.map((data) => {
            app_ctx.IMAGES.push(data);
          });
          setLoaded(true);
        };
      };
    }
  }
  return (
    <div className="w3-col s2" id="lienzos_history">
      <button onClick={cargar}>cargar</button>
      <button onClick={quitar}>quitar</button>
    </div>
  );
}
export default HistoryBar;
