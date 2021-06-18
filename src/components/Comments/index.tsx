import React, { Component } from 'react';

import styles from './comments.module.scss';

export default class Comments extends Component {
  constructor(props) {
    super(props);
    this.commentBox = React.createRef();
  }

  componentDidMount() {
    let scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', 'https://utteranc.es/client.js');
    scriptEl.setAttribute('crossorigin', 'anonymous');
    scriptEl.setAttribute('async', true);
    scriptEl.setAttribute('repo', process.env.GITHUB_COMMENTS);
    scriptEl.setAttribute('issue-term', 'title');
    scriptEl.setAttribute('label', 'blog-comment');
    scriptEl.setAttribute('theme', 'github-dark');
    this.commentBox.current.appendChild(scriptEl);
  }

  render() {
    return <div ref={this.commentBox} className={styles.commentBox}></div>;
  }
}