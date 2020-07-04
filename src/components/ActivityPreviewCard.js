import React from "react";
// import { Link } from "react-router-dom";
import "./ActivityPreviewCard.scss";
import gifloader from "../assets/images/276.gif";
import { Link } from "react-router-dom";
const ActivityPreviewCard = (props) => {
  const activity = props.activity;

  function onSelect(id) {
    const { handleSelect } = props;
    if (handleSelect) {
      handleSelect(id);
    }
  }

  return (
    <Link
      to={"/playlist/preview/" + props.playlist + "/resource/" + activity._id}
    >
      <li
      //   onclick={() => {
      //     onSelect(activity._id);
      //     try {
      //       document.getElementById(
      //         "curriki-h5p-wrapper"
      //       ).innerHTML = ` <div class="loader_gif">
      //       <img src='${gifloader}' alt="" />
      //     </div>`;
      //     } catch (e) {}
      //   }}
      >
        <div>
          <i className="fa fa-play-circle-o" aria-hidden="true"></i>
          <div className="title">{activity.title}</div>
        </div>
        <div className="dated">
          {new Date(activity.created_at).toDateString()}
        </div>
      </li>
    </Link>
  );
};

export default ActivityPreviewCard;
