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
    },
    addHTMLContent:function(){
        var self = this;
        self.emptyContent();
        this.inherited(arguments);
        //TODO Set a parameter for this
        dojo.addClass(dojo.query('#' + self._id + ' .pundit-fp-content-list.pundit-horizontal-list')[0], 'pundit-stop-wheel-propagation');
    },
    show:function(x,y){
        this.inherited(arguments);
        var self = this,
            h = dojo.position(dojo.query('#' + self._id + ' .pundit-fp-content-container')[0]).h;
        
        dojo.removeClass(self._id, 'pundit-smooth');
        if (h > self.maxHeight){
            h = self.maxHeight;
        }

        dojo.style(self._id, 'min-height', h + 20 +'px');
        dojo.style(self._id, 'max-height', self.maxHeight + 'px');
        dojo.style(dojo.query('#' + self._id + ' .pundit-fp-content-list.pundit-horizontal-list')[0], 'height', h +'px');    
        dojo.style(self._id, 'top', y - 15 - h + 'px');
        if (x < dojo.window.getBox().w/2){
            dojo.removeClass(self._id, 'pundit-right-panel');
            dojo.style(self._id, 'left', x - 16 + 'px');
        }
        else{
            dojo.addClass(self._id, 'pundit-right-panel');
            dojo.style(self._id, 'left', x - 300 + 14 + 'px');
            //dojo.style(self._id, 'left', x - 16 + 'px');
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
            dojo.style(dojo.query('#' + self._id + ' .pundit-fp-content-list')[0], 'height', '280px');
            dh = 300 - panelpos.h;
        }else{
            dojo.style(dojo.query('#' + self._id + ' .pundit-fp-content-list')[0], 'height', p.h + 'px');
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