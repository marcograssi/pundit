/* 
    Pundit: a novel semantic web annotation tool
    Copyright (c) 2013 Net7 SRL, <http://www.netseven.it/>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    See LICENSE.TXT or visit http://thepund.it for the full text of the license.
*//**
 * @class pundit.ResourcesPanel
 * @extends pundit.BasePanel
 * @description Provides a GUI (floating Panel) for showing items grouped according 
 * from their provenance ('My Item', 'Page Items', Vocabularies)
 */
dojo.provide("pundit.TimelineAnnotationPanel");
dojo.declare("pundit.TimelineAnnotationPanel", pundit.BasePanel, {
    constructor:function(options){
        var self = this;
        self.maxHeight = options.maxHeight || 300;
        // self.initHTML();
        dojo.addClass(self._id, 'pundit-timeline-annotation-panel');
        self.initBehaviors(); 
    },
    initBaseHTML:function(){
        var self = this;
        self.log('Init HTML Base Panel');
        if (typeof self.name !== 'undefined')
            self._id = 'pundit-fp-' + self.name;
        else
            self._id = 'pundit-fp-' + Math.rand(100);
        
        var c ='<div id="' + self._id + '" class="pundit-base pundit-fp pundit-hidden pundit-disable-annotation pundit-stop-wheel-propagation">';
        c += '  <div class="pundit-fp-header"><span class="pundit-fp-title">' + self.title + '</span><span class="pundit-fp-close pundit-icon-close"></span></div>';
        c += '  <ul class="pundit-fp-content-list pundit-horizontal-list">';
        c += '      <li>';
        c += '          <div class="pundit-fp-content-container pundit-fp-container">';
        c += '          </div>';
        c += '      </li>';
        c += '      <li class="pundit-fp-preview-list pundit-stop-wheel-propagation fillheight">';
        c += '          <div class="pundit-fp-container fillheight pundit-stop-wheel-propagation">';
        c += '              <span id="' + self._id + '-preview-hide" style="cursor: pointer">- [hide preview]</span><div id ="' + self._id + '-preview" class="pundit-fp-preview pundit-moreinfo-panel pundit-stop-wheel-propagation fillheight"></div>';
        c += '          </div>';
        c += '      </li>';
        c += '  </ul>';
        c += '  <div class=".pundit-fp-footer" style="width:100%; height:30px"><span class="semtube-annotate-button pundit-gui-button">Annotate</span><span class="semtube-play-button pundit-gui-button">Play</span></div>';
        c += '</div>';
        
        dojo.query(self.container).append(c);
    },
    addHTMLContent:function(){
        var self = this;
        self.emptyContent();
        this.inherited(arguments);
        //TODO Set a parameter for this
        //Move somewhere else>
        dojo.addClass(dojo.query('#' + self._id + ' .pundit-fp-content-list.pundit-horizontal-list')[0], 'pundit-stop-wheel-propagation');
    },
    initBehaviors: function() {
        var self = this;
        this.inherited(arguments);
        dojo.behavior.add({
            "#pundit-fp-timelineAnnotationPanel .semtube-play-button":{
                'onclick':function(e){
                    semlibVideoPlayer.playFragment(self._uri);
                }
            },
            "#pundit-fp-timelineAnnotationPanel .semtube-annotate-button":{
                'onclick':function(e){
                    var item = _PUNDIT.items.getItemByUri(self._uri);
                    _PUNDIT['commentTag'].initPanel(item, 'Comment Tag');
                }
            }
        });
    },
    show:function(x,y,mfUri){
        this.inherited(arguments);
        var self = this,
            h = dojo.position(dojo.query('#' + self._id + ' .pundit-fp-content-container')[0]).h;
        self._uri = mfUri;
        dojo.removeClass(self._id, 'pundit-smooth');
        if (h > self.maxHeight){
            h = self.maxHeight;
        }
        dojo.style(self._id, 'min-height', h + 20 + 30 +'px');
        dojo.style(self._id, 'max-height', self.maxHeight + 'px');
        
        dojo.style(dojo.query('#' + self._id + ' .pundit-fp-content-list.pundit-horizontal-list')[0], 'height', h - 30 + 30 +'px');    
        dojo.style(self._id, 'top', y + 5 - h - 30 + 'px');
        if (x + semlibVideoAnnotationViewer.myScroll.x < dojo.window.getBox().w/2){
            dojo.removeClass(self._id, 'pundit-right-panel');
            dojo.style(self._id, 'left', x - 16 + 'px');
        }
        else{
            dojo.addClass(self._id, 'pundit-right-panel');
            dojo.style(self._id, 'left', x - 300 + 14 + 'px');
        }
        self.setPanelTime(x);
        setTimeout(function() {
            dojo.addClass(self._id, 'pundit-smooth');
        }, 1000);
        //Add the arrow
        //Resize according to the size of the screen
    },
    hide:function(){
        this.inherited(arguments);
        var self = this;
        dojo.removeClass(self._id, 'pundit-smooth')
    },
    //Update the height and the position of the panel taking into account how its height is expected to grow
    update:function(){
        var self = this,
            dh,
            panelpos = dojo.position(self._id),
            panelposY = dojo.style(self._id, 'top'),
            p = dojo.position(dojo.query('#' + self._id + ' .pundit-fp-content-container')[0]);

        //TODO Fix top because something goes wrong when expanding the panel
        if (p.h >= 280){
            dojo.style(dojo.query('#' + self._id + ' .pundit-fp-content-list')[0], 'height', 280 - 30  +'px');
            dh = 300 - panelpos.h;
        }else{
            dojo.style(dojo.query('#' + self._id + ' .pundit-fp-content-list')[0], 'height', p.h - 30 + 'px');
            dh = p.h + 20 - panelpos.h;
        }
        dojo.style(self._id, 'top', panelposY - dh  + 'px');
    },
    setPanelTime:function(x){
        var self = this,
            timelineWidth = dojo.style(dojo.byId('pundit-timeline-container'), 'width'),
            duration = semlibVideoPlayer.videoInfo.entry.media$group.media$content[0].duration;

        self.panelTime = x * (duration/timelineWidth);
    },
    repositionatePanel:function(){
        var self = this,
            timelineWidth = dojo.style(dojo.byId('pundit-timeline-container'), 'width'),
            duration = semlibVideoPlayer.videoInfo.entry.media$group.media$content[0].duration,
            left = annotationPanel.panelTime * (timelineWidth/duration);

        if (dojo.hasClass(self._id,'pundit-right-panel'))
            left -= 300;
        dojo.style(self._id, 'left', left + 'px');
    }
});