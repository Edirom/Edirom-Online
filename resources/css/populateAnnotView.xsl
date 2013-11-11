<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:mei="http://www.music-encoding.org/ns/mei" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" exclude-result-prefixes="xs xd" version="2.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> Jan 18, 2012</xd:p>
            <xd:p>
                <xd:b>Author:</xd:b> johannes</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
    <xsl:output indent="yes" method="xhtml" omit-xml-declaration="yes"/>
    <xsl:template match="/">
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="node() | @*">
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="mei:annot[@type eq 'editorialComment' and @xml:id eq 'd1e254']">
        <div class="annotView" xsl:exclude-result-prefixes="mei xhtml">
            <div class="metaBox">
                <a href="#" class="collapseLink">Metainformationen ausblenden</a>
                <div class="property">
                    <div class="key">Participants</div>
                    <div class="value">
                        <xsl:value-of select="@plist"/>
                        <!--<a href="#" class="pLink">Takt 23</a> (<a href="#" class="pLink">A<sub>1</sub>-pt</a>, "Andante maestoso" <a href="#" class="pLink">Seite 1</a>)<br/> 
                        <a href="#" class="pLink">Takt 24</a> (<a href="#" class="pLink">A<sub>1</sub>-pt</a>, "Andante maestoso" <a href="#" class="pLink">Seite 1</a>)<br/>-->
                    </div>
                </div>
                <div class="property">
                    <div class="key">Priority</div>
                    <div class="value">
                        <xsl:value-of select="./mei:ptr[@type eq 'priority']/@target"/>
                    </div>
                </div>
                <div class="property">
                    <div class="key">Categories</div>
                    <div class="value">
                        <xsl:value-of select="./mei:ptr[@type eq 'categories']/@target"/>
                    </div>
                </div>
            </div>
            <div class="contentBox">
                <h1>
                    <xsl:value-of select="./mei:title/text()"/>
                </h1>
                <xsl:apply-templates select="./mei:p" mode="valueOnly"/>
            </div>
            <div class="pFlow">
                <div class="pFlowContent">
                    <div class="previewItem">
                        <div class="imgBox">
                            <img src="http://dict.tu-chemnitz.de/pics/beolingus.png" class="previewImg"/>
                        </div>
                        <div class="label">Takt 23</div>
                    </div>
                </div>
            </div>
        </div>
    </xsl:template>
    <xsl:template match="mei:annot/mei:p" mode="valueOnly" exclude-result-prefixes="mei xhtml">
        <p>
            <xsl:apply-templates mode="valueOnly"/>
        </p>
    </xsl:template>
    <xsl:template match="text()" mode="valueOnly">
        <xsl:copy/>
    </xsl:template>
</xsl:stylesheet>